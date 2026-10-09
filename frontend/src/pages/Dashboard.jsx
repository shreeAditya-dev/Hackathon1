import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import Navbar from "../components/Navbar";
import { analyzeSowing } from "../services/api";

const STORAGE_KEY = "agrisentinal_analysis";
const DEFAULT_REGION = [
  { lat: 26.88, lng: 75.72 },
  { lat: 26.88, lng: 75.86 },
  { lat: 26.98, lng: 75.86 },
  { lat: 26.98, lng: 75.72 },
];

function hasValidRegion(region) {
  return (
    Array.isArray(region) &&
    region.length >= 3 &&
    region.every(
      (point) =>
        point &&
        Number.isFinite(Number(point.lat)) &&
        Number.isFinite(Number(point.lng))
    )
  );
}

function getStoredAnalysis() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);

    if (!parsed?.crop || !parsed?.location || !parsed?.soilType || !parsed?.soil) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Storage Error:", error);
    return null;
  }
}

function hasCurrentSoilDetails(analysis) {
  const soil = analysis?.soil;

  if (soil?.dataAvailable) {
    return true;
  }

  return Boolean(
    soil?.regionalEstimate &&
      soil.phRange &&
      soil.clayRange &&
      soil.sandRange
  );
}

function formatDate(dateString) {
  if (!dateString) return "--";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    month: "2-digit",
    day: "2-digit",
  });
}

function Dashboard() {
  const navigate = useNavigate();

  const [activeRange, setActiveRange] = useState("7 Days");

  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalysis = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError("");

      const stored = getStoredAnalysis();

      if (
        !forceRefresh &&
        stored &&
        hasCurrentSoilDetails(stored)
      ) {
        setAnalysisData(stored);
        setLoading(false);
        return;
      }

      const requestData = stored
        ? {
            crop: stored.crop,
            location: stored.location,
            region: hasValidRegion(stored.region)
              ? stored.region
              : DEFAULT_REGION,
          }
        : {
            crop: "Bajra",
            location: "Jaipur",
            region: DEFAULT_REGION,
          };

      const result = await analyzeSowing(requestData);

      console.log("Dashboard Backend Response:", result);

      if (!result?.success || !result?.data) {
        setError("Analysis failed. Backend returned invalid data.");
        return;
      }

      const dataToSave = {
        ...result.data,
        savedAt: new Date().toISOString(),
      };

      setAnalysisData(dataToSave);

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(dataToSave)
      );
    } catch (error) {
      console.error("Dashboard API Error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to connect with backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis(false);
  }, []);

  const probability = Number(
    analysisData?.probability ?? 0
  );

  const weather = analysisData?.weather;
  const soil = analysisData?.soil;
  const monsoon = analysisData?.monsoon;
  const recommendation = analysisData?.recommendation;

  /*
   * REAL RAINFALL FORECAST
   * Backend se weather.rainfallForecast aa raha hai.
   */
  const rainfallForecast =
    weather?.rainfallForecast || [];

  const forecastDays =
    activeRange === "7 Days"
      ? rainfallForecast.slice(0, 7)
      : rainfallForecast.slice(0, 14);
  const expectedRainfall = rainfallForecast.reduce(
    (total, day) => total + Number(day.rainfall || 0),
    0
  );

  /*
   * Chart ke liye maximum rainfall find kar rahe hain.
   * Isse bars properly visible rahenge.
   */
  const maxRainfall = Math.max(
    ...forecastDays.map((item) =>
      Number(item?.rainfall ?? 0)
    ),
    1
  );

  return (
    <div className="min-h-screen bg-[#04100c] text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pb-20 pt-32">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

          <div>
            <div className="mb-3 flex items-center gap-2 text-xs text-emerald-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              LIVE AGRICULTURE DASHBOARD
            </div>

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Sowing
              <span className="text-emerald-400">
                {" "}Intelligence
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              {analysisData?.location || "Jaipur"}, Rajasthan ·{" "}
              {analysisData?.crop || "Bajra"} · Kharif Season 2026
            </p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={() => loadAnalysis(true)}
              disabled={loading}
              className="w-fit rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Analysing..."
                : "↻ Refresh Analysis"}
            </button>

            <button
              onClick={() => navigate("/analysis")}
              className="w-fit rounded-2xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
            >
              + New Analysis
            </button>

          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading && !analysisData && (
          <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.025] p-8 text-center">

            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-emerald-400/20 border-t-emerald-400" />

            <p className="text-sm text-gray-400">
              Fetching real weather and generating sowing analysis...
            </p>

          </div>
        )}

        {/* LOCATION BAR */}
        <div className="mt-8 flex flex-wrap items-center gap-3">

          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3">
            <span>📍</span>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-600">
                Location
              </p>

              <p className="text-sm font-medium">
                {analysisData?.location || "Jaipur"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3">
            <span>🌾</span>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-600">
                Crop
              </p>

              <p className="text-sm font-medium">
                {analysisData?.crop || "Bajra"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3">
            <span>☁️</span>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-600">
                Season
              </p>

              <p className="text-sm font-medium">
                Kharif
              </p>
            </div>
          </div>

        </div>

        {/* MAIN RESULT */}
        <section className="mt-8 grid gap-5 lg:grid-cols-[1.5fr_0.5fr]">

          {/* SOWING RESULT */}
          <div className="relative overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-950/80 via-[#071811] to-[#04100c] p-8">

            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-emerald-400/10" />

            <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full border border-emerald-400/5" />

            <div className="relative">

              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
                    Live Sowing Analysis
                  </p>

                  <h2 className="mt-5 text-3xl font-bold md:text-4xl">
                    {recommendation?.status || "Analysing..."}
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
                    {recommendation?.recommendation ||
                      "Analysing current weather, soil and monsoon conditions..."}
                  </p>
                </div>

                <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/5">

                  <span className="text-2xl font-bold text-emerald-400">
                    {probability}%
                  </span>

                  <span className="text-[9px] uppercase tracking-wider text-gray-500">
                    Probability
                  </span>

                </div>

              </div>

              {/* PROBABILITY BAR */}
              <div className="mt-10">

                <div className="mb-3 flex justify-between text-[10px] text-gray-600">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>

                <div className="relative h-3 overflow-hidden rounded-full bg-white/5">

                  <div
                    className="h-full rounded-full bg-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.4)] transition-all duration-1000"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, probability)
                      )}%`,
                    }}
                  />

                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Current sowing suitability: {probability}%
                </div>

              </div>

            </div>
          </div>

          {/* CONFIDENCE */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-7">

            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Prediction Confidence
            </p>

            <div className="mt-8 flex items-center justify-center">

              <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-[13px] border-emerald-400/10">

                <div
                  className="absolute inset-[-13px] rounded-full border-[13px] border-transparent border-r-emerald-400 border-t-emerald-400"
                  style={{
                    transform: `rotate(${25 + probability * 2.5}deg)`,
                  }}
                />

                <div className="text-center">

                  <p className="text-4xl font-bold">
                    {probability >= 75
                      ? "High"
                      : probability >= 50
                      ? "Medium"
                      : "Low"}
                  </p>

                  <p className="mt-1 text-xs text-emerald-400">
                    {probability}% score
                  </p>

                </div>

              </div>
            </div>

            <p className="mt-7 text-center text-xs leading-5 text-gray-600">
              Based on current weather, soil conditions and monsoon status
              returned by the analysis engine.
            </p>

          </div>

        </section>

        {/* METRICS */}
        <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          {/* TEMPERATURE */}
          <div className="group rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-emerald-400/20">

            <div className="flex items-center justify-between">
              <span className="text-3xl">🌡️</span>

              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] text-emerald-400">
                Live
              </span>
            </div>

            <p className="mt-6 text-xs uppercase tracking-wider text-gray-600">
              Temperature
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              {weather?.temperature ?? "--"}°C
            </h3>

            <p className="mt-2 text-xs text-gray-500">
              Current temperature
            </p>

          </div>

          {/* HUMIDITY */}
          <div className="group rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-emerald-400/20">

            <div className="flex items-center justify-between">
              <span className="text-3xl">💧</span>

              <span className="text-xs text-emerald-400">
                Live
              </span>
            </div>

            <p className="mt-6 text-xs uppercase tracking-wider text-gray-600">
              Humidity
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              {weather?.humidity ?? "--"}%
            </h3>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">

              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-1000"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, weather?.humidity ?? 0)
                  )}%`,
                }}
              />

            </div>

          </div>

          {/* RAINFALL */}
          <div className="group rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-emerald-400/20">

            <div className="flex items-center justify-between">
              <span className="text-3xl">🌧️</span>

              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] text-emerald-400">
                Live
              </span>
            </div>

            <p className="mt-6 text-xs uppercase tracking-wider text-gray-600">
              Rainfall
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              {weather?.rainfall ?? "--"} mm
            </h3>

            <p className="mt-2 text-xs text-gray-500">
              Current precipitation
            </p>

          </div>

          {/* WIND */}
          <div className="group rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-emerald-400/20">

            <div className="flex items-center justify-between">
              <span className="text-3xl">💨</span>

              <span className="text-xs text-emerald-400">
                Live
              </span>
            </div>

            <p className="mt-6 text-xs uppercase tracking-wider text-gray-600">
              Wind Speed
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              {weather?.windSpeed ?? "--"} km/h
            </h3>

            <p className="mt-2 text-xs text-gray-500">
              Current wind speed
            </p>

          </div>

        </section>

        {/* SOIL + MONSOON */}
        <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* SOIL TYPE */}
          <div className="group rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-emerald-400/20">

            <div className="flex items-center justify-between">
              <span className="text-3xl">🌱</span>

              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] text-emerald-400">
                Suitable
              </span>
            </div>

            <p className="mt-6 text-xs uppercase tracking-wider text-gray-600">
              Soil Type
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              {soil?.soilType || "--"}
            </h3>

            <p className="mt-2 text-xs text-gray-500">
              {soil?.dataAvailable
                ? "Estimated from mapped soil texture"
                : soil?.regionalEstimate
                  ? "Broad state/district estimate"
                  : "Soil map data unavailable"}
            </p>

          </div>

          {/* MODELLED SOIL MOISTURE */}
          <div className="group rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-emerald-400/20">

            <div className="flex items-center justify-between">
              <span className="text-3xl">💧</span>

              <span className="text-xs text-emerald-400">
                Modelled
              </span>
            </div>

            <p className="mt-6 text-xs uppercase tracking-wider text-gray-600">
              Topsoil Moisture
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              {weather?.soilMoisture ?? "--"}%
            </h3>

            <p className="mt-2 text-xs text-gray-500">
              Open-Meteo surface estimate
            </p>

          </div>

          {/* SOIL PH */}
          <div className="group rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-emerald-400/20">

            <div className="flex items-center justify-between">
              <span className="text-3xl">🧪</span>

              <span className="text-xs text-emerald-400">
                pH
              </span>
            </div>

            <p className="mt-6 text-xs uppercase tracking-wider text-gray-600">
              Soil pH
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              {soil?.phRange || soil?.ph || "--"}
            </h3>

            <p className="mt-2 text-xs text-gray-500">
              {soil?.regionalEstimate
                ? "Typical range · regional estimate"
                : "Mapped soil estimate"}
            </p>

          </div>

          {/* MONSOON */}
          <div className="group rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-emerald-400/20">

            <div className="flex items-center justify-between">
              <span className="text-3xl">🌦️</span>

              <span className="text-xs text-emerald-400">
                {monsoon?.monsoonStatus || "--"}
              </span>
            </div>

            <p className="mt-6 text-xs uppercase tracking-wider text-gray-600">
              Monsoon
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              {rainfallForecast.length > 0
                ? `${expectedRainfall.toFixed(1)} mm`
                : "--"}
            </h3>

            <p className="mt-2 text-xs text-gray-500">
              Forecast total · next 14 days
            </p>

          </div>

          {/* MONSOON START */}
          <div className="group rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-emerald-400/20">

            <div className="flex items-center justify-between">
              <span className="text-3xl">📅</span>

              <span className="text-xs text-emerald-400">
                Forecast
              </span>
            </div>

            <p className="mt-6 text-xs uppercase tracking-wider text-gray-600">
              Monsoon Start
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              {monsoon?.monsoonStart || "--"}
            </h3>

            <p className="mt-2 text-xs text-gray-500">
              Expected onset month
            </p>

          </div>

        </section>

        {/* ====================================================== */}
        {/* REAL RAINFALL FORECAST */}
        {/* ====================================================== */}

        <section className="mt-5 rounded-[2rem] border border-white/10 bg-white/[0.025] p-7 md:p-9">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
                Forecast
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Rainfall Outlook
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Expected rainfall intensity for the upcoming period.
              </p>

            </div>

            {/* RANGE BUTTONS */}
            <div className="flex rounded-xl border border-white/10 bg-black/20 p-1">

              {["7 Days", "14 Days"].map((range) => (

                <button
                  key={range}
                  onClick={() => setActiveRange(range)}
                  className={`rounded-lg px-5 py-3 text-sm transition ${
                    activeRange === range
                      ? "bg-emerald-400 text-black"
                      : "text-gray-500 hover:text-white"
                  }`}
                >
                  {range}
                </button>

              ))}

            </div>

          </div>

          {/* CHART */}
          {forecastDays.length > 0 ? (

            <div className="mt-10">

              <div className="flex h-72 items-end gap-2 overflow-x-auto border-b border-white/10 px-2 pb-0 sm:gap-4">

                {forecastDays.map((item, index) => {

                  const rainfall = Number(
                    item?.rainfall ?? 0
                  );

                  const rainProbability = Number(
                    item?.rainProbability ?? 0
                  );

                  /*
                   * Relative height.
                   * Minimum 4px rakhi hai so 0 rainfall
                   * bhi visible rahe.
                   */
                  const barHeight =
                    rainfall > 0
                      ? Math.max(
                          8,
                          (rainfall / maxRainfall) * 220
                        )
                      : 4;

                  return (
                    <div
                      key={`${item.date}-${index}`}
                      className="group flex h-full min-w-[55px] flex-1 flex-col items-center justify-end"
                    >

                      {/* TOOLTIP */}
                      <div className="mb-2 rounded-lg border border-emerald-400/20 bg-[#071811] px-2 py-1 text-center opacity-0 shadow-xl transition group-hover:opacity-100">

                        <p className="text-[10px] font-semibold text-emerald-400">
                          {rainfall} mm
                        </p>

                        <p className="text-[9px] text-gray-500">
                          {rainProbability}% chance
                        </p>

                      </div>

                      {/* BAR */}
                      <div
                        className="w-full max-w-10 rounded-t-xl bg-emerald-400/70 transition-all duration-500 group-hover:bg-emerald-400"
                        style={{
                          height: `${barHeight}px`,
                        }}
                      />

                      {/* DATE */}
                      <span className="mt-4 text-[10px] text-gray-500">
                        {formatDate(item?.date)}
                      </span>

                    </div>
                  );
                })}

              </div>

              {/* CHART INFO */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  Forecast rainfall
                </div>

                <p className="text-xs text-gray-600">
                  Hover over a bar for rainfall probability
                </p>

              </div>

            </div>

          ) : (

            /* NO FORECAST */
            <div className="mt-10 flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/10">

              <div className="text-center">

                <p className="text-3xl">🌧️</p>

                <p className="mt-3 text-sm text-gray-400">
                  Rainfall forecast is not available.
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  Refresh the analysis to fetch the latest forecast.
                </p>

              </div>

            </div>

          )}

        </section>

        {/* ANALYSIS FACTORS */}
        <section className="mt-5 grid gap-5 lg:grid-cols-2">

          {/* FACTORS */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-7">

            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
              Decision Factors
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Why this result?
            </h2>

            <div className="mt-8 space-y-6">

              {[
                {
                  name: "Temperature",
                  score:
                    weather?.temperature != null
                      ? Math.min(
                          100,
                          Math.max(
                            0,
                            100 -
                              Math.abs(
                                28 -
                                  weather.temperature
                              ) *
                                5
                          )
                        )
                      : 0,
                  icon: "🌡️",
                },
                {
                  name: "Humidity",
                  score: weather?.humidity ?? 0,
                  icon: "💧",
                },
                {
                  name: "Soil pH",
                  score:
                    soil?.ph != null
                      ? soil.ph >= 6 &&
                        soil.ph <= 8
                        ? 100
                        : 50
                      : 0,
                  icon: "🌱",
                },
                {
                  name: "Monsoon",
                  score:
                    monsoon?.monsoonStatus ===
                    "Normal"
                      ? 100
                      : 50,
                  icon: "🌦️",
                },
              ].map((factor) => (

                <div key={factor.name}>

                  <div className="mb-2 flex items-center justify-between">

                    <div className="flex items-center gap-3">
                      <span>{factor.icon}</span>

                      <span className="text-sm text-gray-400">
                        {factor.name}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-emerald-400">
                      {Math.round(factor.score)}%
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/5">

                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all duration-1000"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            factor.score
                          )
                        )}%`,
                      }}
                    />

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* INSIGHT */}
          <div className="relative overflow-hidden rounded-[2rem] border border-emerald-400/15 bg-gradient-to-br from-emerald-950/50 to-white/[0.02] p-7">

            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-400/5 blur-3xl" />

            <div className="relative">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-xl text-black">
                  ✦
                </div>

                <div>

                  <p className="text-xs uppercase tracking-widest text-emerald-400">
                    Insight
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Recommendation
                  </h2>

                </div>

              </div>

              <p className="mt-8 text-lg leading-8 text-gray-300">
                {recommendation?.recommendation ||
                  "Waiting for analysis..."}
              </p>

              <p className="mt-5 text-sm leading-7 text-gray-500">
                The recommendation is generated using the current weather,
                soil and monsoon conditions processed by the backend analysis
                engine.
              </p>

              <div className="mt-8 rounded-2xl border border-white/5 bg-black/20 p-5">

                <p className="text-xs uppercase tracking-wider text-gray-600">
                  Important
                </p>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  This is a decision-support estimate and
                  should be considered alongside local field conditions
                  and agricultural guidance.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* SOWING TIMELINE */}
        <section className="mt-5 rounded-[2rem] border border-white/10 bg-white/[0.025] p-7 md:p-9">

          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
            Sowing Calendar
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            June Sowing Timeline
          </h2>

          <div className="relative mt-12">

            <div className="absolute left-0 right-0 top-5 h-px bg-white/10" />

            <div className="relative grid grid-cols-5 gap-2">

              {[
                {
                  date: "10 Jun",
                  status: "Early",
                  type: "neutral",
                },
                {
                  date: "14 Jun",
                  status: "Watch",
                  type: "watch",
                },
                {
                  date: "16 Jun",
                  status: "Start",
                  type: "best",
                },
                {
                  date: "19 Jun",
                  status: "Peak",
                  type: "best",
                },
                {
                  date: "21 Jun",
                  status: "End",
                  type: "best",
                },
              ].map((item) => (

                <div
                  key={item.date}
                  className="flex flex-col items-center text-center"
                >

                  <div
                    className={`relative z-10 h-10 w-10 rounded-full border-4 border-[#04100c] ${
                      item.type === "best"
                        ? "bg-emerald-400"
                        : item.type === "watch"
                        ? "bg-yellow-400"
                        : "bg-white/20"
                    }`}
                  />

                  <p className="mt-4 text-xs font-semibold">
                    {item.date}
                  </p>

                  <p
                    className={`mt-1 text-[10px] ${
                      item.type === "best"
                        ? "text-emerald-400"
                        : "text-gray-600"
                    }`}
                  >
                    {item.status}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </section>

        {/* CTA */}
        <section className="mt-5 flex flex-col justify-between gap-6 rounded-[2rem] border border-emerald-400/10 bg-emerald-400/[0.03] p-7 md:flex-row md:items-center">

          <div>

            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
              Need another prediction?
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Analyse another crop or location.
            </h2>

          </div>

          <button
            onClick={() => navigate("/analysis")}
            className="w-fit rounded-2xl bg-emerald-400 px-6 py-3 font-semibold text-black transition hover:bg-emerald-300"
          >
            Start New Analysis →
          </button>

        </section>

      </main>
    </div>
  );
}

export default Dashboard;