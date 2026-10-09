"""
AgriSentinal00 Flask API Server
Bridges the Hackathon1-Copy React frontend with AgriSentinal's Python analysis engine.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import json
import traceback
from datetime import datetime, timezone

# Ensure the backend directory is on sys.path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

app = Flask(__name__)
CORS(app)

# ── Load AgriSentinal modules (graceful fallback if unavailable) ──────────────

try:
    from services.weather import WeatherService
    WEATHER_AVAILABLE = True
except Exception as e:
    WEATHER_AVAILABLE = False
    WEATHER_ERROR = str(e)
    print(f"[WARN] Weather service unavailable: {e}")

try:
    from analysis.monsoon import (
        calculate_monsoon_onset,
        calculate_typical_onset,
        summarize_historical_rainfall,
        classify_onsom_behavior,
    )
    MONSOON_AVAILABLE = True
except Exception as e:
    MONSOON_AVAILABLE = False
    print(f"[WARN] Monsoon analysis unavailable: {e}")

try:
    from services.soil import SoilService, CROP_SOIL_REQUIREMENTS
    SOIL_AVAILABLE = True
except Exception as e:
    SOIL_AVAILABLE = False
    print(f"[WARN] Soil service unavailable: {e}")

try:
    from models.decision_engine import (
        compute_window_scores,
        recommend_window,
        CROP_ESTABLISHMENT,
    )
    ENGINE_AVAILABLE = True
except Exception as e:
    ENGINE_AVAILABLE = False
    print(f"[WARN] Decision engine unavailable: {e}")

# ── Load config files ──────────────────────────────────────────────────────────

CONFIG_DIR = os.path.join(BACKEND_DIR, "config")

try:
    with open(os.path.join(CONFIG_DIR, "state_district.json"), encoding="utf-8") as f:
        STATE_DISTRICT_DATA = json.load(f)
except Exception as e:
    STATE_DISTRICT_DATA = {}
    print(f"[WARN] Could not load state_district.json: {e}")

try:
    with open(os.path.join(CONFIG_DIR, "crop_config.json"), encoding="utf-8") as f:
        CROP_CONFIG = json.load(f)
except Exception as e:
    CROP_CONFIG = {}
    print(f"[WARN] Could not load crop_config.json: {e}")


# ── Helper functions ───────────────────────────────────────────────────────────

def centroid(region):
    """Compute the geographic centroid of a polygon list [{lat, lng}, ...]."""
    lats = [float(p["lat"]) for p in region]
    lngs = [float(p["lng"]) for p in region]
    return sum(lats) / len(lats), sum(lngs) / len(lngs)


def get_weather_dataframes(lat, lon):
    """Fetch historical, forecast, and recent-rainfall DataFrames via AgriSentinal WeatherService."""
    if not WEATHER_AVAILABLE:
        return None, None, None
    try:
        service = WeatherService().set_location(lat, lon)
        historical = service.get_historical_weather()
        forecast   = service.get_forecast(days=7)
        recent     = service.get_recent_rainfall(days=30)
        return historical, forecast, recent
    except Exception as e:
        print(f"[ERR] Weather fetch error: {e}")
        return None, None, None


def build_weather_summary(historical_df, forecast_df, recent_df, crop="soybean"):
    """
    Collapse the DataFrames into a detailed weather dict:
      temperature, tempMax, tempMin, tempAvg, humidity, rainfall, windSpeed, soilMoisture, rainfallForecast[]
    """
    weather = {
        "temperature":      None,
        "tempMax":          None,
        "tempMin":          None,
        "tempAvg":          None,
        "humidity":         None,
        "rainfall":         None,
        "windSpeed":        None,
        "soilMoisture":     None,
        "rainfallForecast": [],
        "center":           None,
        "samplePoints":     [],
    }

    # ── Forecast: temperature & 7-day rainfall/temp list ──
    if forecast_df is not None and not forecast_df.empty:
        try:
            max_t = float(forecast_df["temp_max"].iloc[0])
            min_t = float(forecast_df["temp_min"].iloc[0]) if "temp_min" in forecast_df.columns else max_t - 8.0
            avg_t = round((max_t + min_t) / 2.0, 1)

            weather["temperature"] = round(max_t, 1)
            weather["tempMax"]     = round(max_t, 1)
            weather["tempMin"]     = round(min_t, 1)
            weather["tempAvg"]     = avg_t

            temp_forecast = []
            for _, row in forecast_df.head(7).iterrows():
                d_obj = row["date"].date() if hasattr(row["date"], "date") else row["date"]
                high = round(float(row.get("temp_max") or 32.0), 1)
                low  = round(float(row.get("temp_min") or (high - 8.0)), 1)
                rain = round(float(row.get("rain_sum") or 0.0), 1)
                temp_forecast.append({
                    "date": str(d_obj),
                    "dayName": d_obj.strftime("%a") if hasattr(d_obj, "strftime") else str(d_obj),
                    "tempMax": high,
                    "tempMin": low,
                    "rainfall": rain,
                })
            weather["temperatureForecast"] = temp_forecast
            weather["rainfallForecast"] = [
                {"date": tf["date"], "rainfall": tf["rainfall"]}
                for tf in temp_forecast
            ]
        except Exception as e:
            print(f"[WARN] Forecast parse: {e}")


    # ── Recent: total 30-day rainfall ──
    if recent_df is not None and not recent_df.empty:
        try:
            col = "rain" if "rain" in recent_df.columns else "rain_sum"
            weather["rainfall"] = round(float(recent_df[col].sum()), 1)
        except Exception as e:
            print(f"[WARN] Recent rainfall parse: {e}")

    # ── Historical: humidity estimate & historical temp averages ──
    if historical_df is not None and not historical_df.empty:
        try:
            rain_30d = float(historical_df["rain_sum"].tail(30).sum())
            weather["humidity"] = int(min(95, max(30, 40 + rain_30d * 0.3)))
            if weather["tempMax"] is None and "temp_max" in historical_df.columns:
                last_hist = historical_df.iloc[-1]
                weather["tempMax"] = round(float(last_hist["temp_max"]), 1)
                weather["tempMin"] = round(float(last_hist.get("temp_min", last_hist["temp_max"] - 8.0)), 1)
                weather["temperature"] = weather["tempMax"]
                weather["tempAvg"] = round((weather["tempMax"] + weather["tempMin"]) / 2.0, 1)
        except Exception as e:
            print(f"[WARN] Humidity / temperature parse: {e}")

    # ── Derived: modelled topsoil moisture ──
    if weather["rainfall"] is not None:
        weather["soilMoisture"] = min(50, max(5, int(weather["rainfall"] * 0.18)))

    return weather


def get_monsoon_summary(historical_df):
    """Run AgriSentinal monsoon analysis and return a compact dict for the frontend."""
    base = {
        "monsoonStatus":    "Normal",
        "expectedRainfall": 650,
        "monsoonStart":     "June",
    }
    if not MONSOON_AVAILABLE or historical_df is None or historical_df.empty:
        return base
    try:
        onset   = calculate_monsoon_onset(historical_df)
        typical = calculate_typical_onset(historical_df)
        summary = summarize_historical_rainfall(historical_df)

        onset_doy   = onset.get("onset_day_of_year") if onset else None
        onset_class = onset.get("classification",  "Normal") if onset else "Normal"
        if onset_doy is not None:
            onset_class = classify_onsom_behavior(onset_doy)

        return {
            "monsoonStatus":       onset_class or "Normal",
            "expectedRainfall":    int(summary.get("total_rainfall", 650)) if summary else 650,
            "monsoonStart":        onset.get("onset_date", "June") if onset else "June",
            "onsetDayOfYear":      onset_doy,
            "typicalOnset":        typical.get("typical_onset_day_of_year") if typical else None,
            "annualRainfall":      summary.get("total_rainfall") if summary else None,
            "maxDrySpellDays":     summary.get("dry_spell_max_days") if summary else None,
            "rainyDays":           summary.get("rainy_days") if summary else None,
        }
    except Exception as e:
        print(f"[ERR] Monsoon analysis: {e}")
        return base


def get_soil_summary(lat, lon, location=""):
    """Fetch soil data from AgriSentinal's SoilService and return a rich dict."""
    if not SOIL_AVAILABLE:
        return {
            "soilType":             "Alluvial (estimated)",
            "texture":              "Loam",
            "sand":                 45.0,
            "clay":                 20.0,
            "silt":                 35.0,
            "ph":                   6.8,
            "phRange":              "6.5 - 7.2",
            "organicMatter":        0.8,
            "bulkDensity":          1.5,
            "waterHoldingCapacity": 180,
            "drainageClass":        "Moderate to good",
            "dataAvailable":        True,
            "regionalEstimate":     True,
            "source":               "AgriSentinal soil model",
        }
    try:
        svc  = SoilService()
        info = svc.get_soil_info(latitude=lat, longitude=lon)
        return {
            "soilType":              info.get("soil_type", "Alluvial"),
            "texture":               info.get("texture", "Loam"),
            "sand":                  info.get("sand", 45.0),
            "clay":                  info.get("clay", 20.0),
            "silt":                  info.get("silt", 35.0),
            "ph":                    info.get("ph", 6.8),
            "phRange":               info.get("ph_range", "6.5 - 7.2"),
            "waterHoldingCapacity":  info.get("water_holding_capacity", 180),
            "drainageClass":         info.get("drainage_class", "Moderate"),
            "organicMatter":         info.get("organic_matter", 0.8),
            "bulkDensity":           info.get("bulk_density", 1.5),
            "source":                info.get("source", "AgriSentinal soil model"),
            "dataAvailable":         True,
            "regionalEstimate":      info.get("source") == "fallback_local",
            "samplePointCount":      1,
        }
    except Exception as e:
        print(f"[ERR] Soil fetch: {e}")
        return {
            "soilType":             "Alluvial (fallback)",
            "texture":              "Loam",
            "sand":                 45.0,
            "clay":                 20.0,
            "silt":                 35.0,
            "ph":                   6.8,
            "phRange":              "6.5 - 7.2",
            "waterHoldingCapacity": 180,
            "drainageClass":        "Moderate",
            "organicMatter":        0.8,
            "bulkDensity":          1.5,
            "dataAvailable":        True,
            "regionalEstimate":     True,
            "source":               "Error fallback",
        }



def calculate_probability(crop, weather, soil, monsoon):
    """
    Use AgriSentinal's decision engine to score sowing suitability (0-100).
    Falls back to a simple rule-based score if the engine is unavailable.
    """
    # Map UI crop names → engine crop keys
    crop_key_map = {
        "bajra":    "pulses",      # closest match in engine
        "maize":    "maize",
        "soybean":  "soybean",
        "groundnut":"groundnut",
        "cotton":   "cotton",
        "rice":     "rice",
        "pulses":   "pulses",
        "moong":    "pulses",
    }
    crop_key = crop_key_map.get(crop.lower(), "soybean")

    if ENGINE_AVAILABLE:
        try:
            forecast_rain = sum(
                d.get("rainfall", 0) for d in weather.get("rainfallForecast", [])
            )
            moisture_frac = (weather.get("soilMoisture") or 20) / 100.0
            temp          = weather.get("temperature") or 28.0
            monsoon_class = monsoon.get("monsoonStatus", "Normal")

            scores = compute_window_scores(
                rainfall_mm      = weather.get("rainfall") or 0,
                rainfall_anomaly = 0,
                moisture_fraction= moisture_frac,
                forecast_rain_mm = forecast_rain,
                dry_spell_days   = monsoon.get("maxDrySpellDays") or 3,
                temp_c           = temp,
                monsoon_onset_class = monsoon_class,
                crop             = crop_key,
            )
            best_win, explanation = recommend_window(scores)
            prob = int(explanation.get("suitability_probability", 50))

            window_analysis = []
            for name in ["Early", "Normal", "Late"]:
                w_data = scores.get(name, {})
                s = int(w_data.get("suitability_score", 0))
                if s >= 70:
                    risk_lvl = "Low Risk"
                    suitability_lbl = "Highly Suitable"
                elif s >= 40:
                    risk_lvl = "Moderate Risk"
                    suitability_lbl = "Moderately Suitable"
                else:
                    risk_lvl = "High Risk"
                    suitability_lbl = "Unsuitable"

                notes = []
                for k in ["rainfall adequacy", "soil-moisture suitability", "temperature risk text", "dry-spell risk text", "crop compatibility text"]:
                    if k in w_data and isinstance(w_data[k], list):
                        notes.extend(w_data[k])

                window_analysis.append({
                    "window": name,
                    "score": s,
                    "riskLevel": risk_lvl,
                    "suitability": suitability_lbl,
                    "isRecommended": (name == best_win),
                    "notes": notes,
                })

            return prob, scores, window_analysis
        except Exception as e:
            print(f"[ERR] Decision engine: {e}")

    return 30, {}, []



def build_recommendation(crop, probability, weather, soil, monsoon):
    """Generate crop-specific recommendation text using AgriSentinal's crop_config."""
    crop_info = CROP_CONFIG.get(crop.lower(), {})

    if probability >= 75:
        status = "Highly Suitable"
        text = (
            f"{crop} sowing conditions are highly suitable. "
            "Weather, soil and monsoon factors are well aligned for good crop establishment."
        )
    elif probability >= 50:
        status = "Moderately Suitable"
        text = (
            f"{crop} sowing is moderately suitable. "
            "Conditions are acceptable — monitor rainfall and soil moisture closely before sowing."
        )
    else:
        status = "Not Suitable"
        text = (
            f"{crop} sowing conditions are currently unfavourable. "
            "Insufficient rainfall or soil moisture — consider waiting for the monsoon to establish."
        )

    if crop_info:
        text += (
            f" Recommended sowing period: {crop_info.get('sowing_period', 'June–July')}. "
            f"Crop duration: {crop_info.get('crop_duration', 'N/A')}. "
            f"Total water requirement: {crop_info.get('water_requirement', 'N/A')}."
        )
    if not soil.get("dataAvailable"):
        text += (
            " Note: Precise soil texture data unavailable — "
            "analysis based on weather and modelled soil moisture only."
        )

    return {"status": status, "recommendation": text}


# ── API Endpoints ──────────────────────────────────────────────────────────────

@app.route("/", methods=["GET"])
def root():
    return jsonify({"success": True, "message": "AgriSentinal00 API is running 🌱"})


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "message": "API is healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "weather":        WEATHER_AVAILABLE,
            "monsoon":        MONSOON_AVAILABLE,
            "soil":           SOIL_AVAILABLE,
            "decisionEngine": ENGINE_AVAILABLE,
        },
    })


@app.route("/api/sowing/analyze", methods=["POST"])
def analyze_sowing():
    """
    Main sowing analysis endpoint.
    Accepts: { crop, location, region: [{lat, lng}, ...] }
    Returns: comprehensive sowing window analysis using AgriSentinal's engine.
    """
    try:
        body     = request.get_json(force=True) or {}
        crop     = (body.get("crop") or "").strip()
        location = (body.get("location") or "").strip()
        region   = body.get("region", [])

        # ── Validate ──
        if not crop:
            return jsonify({"success": False, "message": "Crop is required"}), 400
        if not location:
            return jsonify({"success": False, "message": "Location is required"}), 400
        if (
            not isinstance(region, list)
            or len(region) < 3
            or not all(
                isinstance(p, dict)
                and "lat" in p and "lng" in p
                and -90 <= float(p["lat"]) <= 90
                and -180 <= float(p["lng"]) <= 180
                for p in region
            )
        ):
            return jsonify({
                "success": False,
                "message": "A valid polygon with at least 3 {lat, lng} points is required",
            }), 400

        # ── Compute centroid ──
        lat, lon = centroid(region)

        # ── Fetch data from AgriSentinal services ──
        historical_df, forecast_df, recent_df = get_weather_dataframes(lat, lon)

        weather         = build_weather_summary(historical_df, forecast_df, recent_df)
        weather["center"] = {"latitude": lat, "longitude": lon}
        weather["samplePoints"] = [{"lat": lat, "lng": lon}]

        monsoon         = get_monsoon_summary(historical_df)
        soil            = get_soil_summary(lat, lon, location)

        probability, window_scores, window_analysis = calculate_probability(crop, weather, soil, monsoon)
        rec             = build_recommendation(crop, probability, weather, soil, monsoon)

        return jsonify({
            "success": True,
            "message": "Area-level sowing analysis completed",
            "data": {
                "crop":           crop,
                "location":       location,
                "soilType":       soil.get("soilType"),
                "region":         region,
                "probability":    probability,
                "recommendation": rec["recommendation"],
                "status":         rec["status"],
                "weather":        weather,
                "soil":           soil,
                "monsoon":        monsoon,
                "windowScores":   window_scores,
                "windowAnalysis": window_analysis,
            },
        })


    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": str(e) or "Unable to complete sowing analysis",
        }), 500


@app.route("/api/weather", methods=["GET"])
def get_weather_endpoint():
    """Weather data for the Dashboard page."""
    lat = request.args.get("lat", type=float, default=20.5937)
    lon = request.args.get("lon", type=float, default=78.9629)
    location = request.args.get("location", "")

    historical_df, forecast_df, recent_df = get_weather_dataframes(lat, lon)
    weather = build_weather_summary(historical_df, forecast_df, recent_df)
    weather["location"] = location

    return jsonify({"success": True, "data": weather})


@app.route("/api/crops", methods=["GET"])
def get_crops():
    """Return crop list — AgriSentinal crop_config + UI extras."""
    ui_extras = {
        "bajra": {"sowing_period": "June to July", "crop_duration": "75-90 days",
                  "water_requirement": "300-450 mm", "optimal_temp": "25-32°C"},
        "moong": {"sowing_period": "June to July", "crop_duration": "60-75 days",
                  "water_requirement": "300-400 mm", "optimal_temp": "25-30°C"},
    }
    merged = {**ui_extras, **CROP_CONFIG}

    crops = [
        {
            "name":             name.capitalize(),
            "duration":         info.get("crop_duration", ""),
            "sowingPeriod":     info.get("sowing_period", ""),
            "waterRequirement": info.get("water_requirement", ""),
            "optimalTemp":      info.get("optimal_temp", ""),
            "drySpellTolerance":info.get("dry_spell_tolerance", ""),
            "monsoonDependence":info.get("monsoon_dependence", ""),
        }
        for name, info in merged.items()
    ]
    return jsonify({"success": True, "data": crops})


@app.route("/api/states", methods=["GET"])
def get_states():
    """Return full state → district mapping from AgriSentinal's config."""
    return jsonify({"success": True, "data": STATE_DISTRICT_DATA})


# ── Startup ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"\n🌱  AgriSentinal00 Flask API  — port {port}")
    print(f"   Weather service  : {'✅ available' if WEATHER_AVAILABLE else '❌ unavailable'}")
    print(f"   Monsoon analysis : {'✅ available' if MONSOON_AVAILABLE else '❌ unavailable'}")
    print(f"   Soil service     : {'✅ available' if SOIL_AVAILABLE else '❌ unavailable'}")
    print(f"   Decision engine  : {'✅ available' if ENGINE_AVAILABLE else '❌ unavailable'}")
    print(f"   Crop config      : {len(CROP_CONFIG)} crops loaded")
    print(f"   States/districts : {len(STATE_DISTRICT_DATA)} states loaded\n")
    app.run(host="0.0.0.0", port=port, debug=True, use_reloader=False)

