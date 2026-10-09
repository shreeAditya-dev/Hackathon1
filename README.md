# AgriSentinal00

**AgriSentinal00** combines the beautiful React UI + interactive map from **Hackathon1-Copy** with the powerful Python data analysis engine from **AgriSentinal**.

## Project Structure

```
AgriSentinal00/
├── frontend/          # React + Vite + TailwindCSS (from Hackathon1-Copy)
│   ├── src/
│   │   ├── pages/         # Home, Dashboard, SowingAnalysis, History, About
│   │   ├── components/    # Navbar, LocationSelector, CropSelector, Map, etc.
│   │   ├── charts/        # Rainfall, Soil Moisture, Sowing Timeline charts
│   │   ├── hooks/         # useSowingAnalysis, useWeather
│   │   └── services/      # API client
│   └── package.json
│
└── backend/           # Python Flask API + AgriSentinal analysis engine
    ├── flask_server.py    # ← Main API server (bridges UI ↔ AgriSentinal)
    ├── app.py             # Streamlit app (original AgriSentinal)
    ├── analysis/          # AI predictor, field outlook, monsoon analysis
    ├── models/            # Decision engine, soil moisture model
    ├── services/          # Weather (Open-Meteo), Soil (SoilGrids), Satellite
    ├── config/            # state_district.json, crop_config.json
    └── requirements.txt
```

## Quick Start

### Windows

Double-click `start.bat` from the project folder, or run it from a terminal opened at the project root:

```bat
start.bat
```

It opens separate terminals for the frontend and backend. If frontend dependencies are missing, the script installs them from `frontend/package-lock.json`. The backend starts only when Python 3 is available; install Python dependencies first with:

```bat
python -m pip install -r backend\requirements.txt
```

### 1. Start the Python Backend

```bash
cd backend
pip install -r requirements.txt
python flask_server.py
# → Running on http://localhost:5001
```

### 2. Start the React Frontend

```bash
cd frontend
npm install
npm run dev
# → Running on http://localhost:5173
```

The Vite dev server is pre-configured to proxy `/api` requests to `http://localhost:5001`.

## What's Integrated

| Feature | Source |
|---------|--------|
| React UI, Navbar, Dark/Light mode | Hackathon1-Copy |
| Interactive Leaflet map with polygon drawing | Hackathon1-Copy |
| Location selector (State/District) | Hackathon1-Copy UI + AgriSentinal full data |
| Crop selector | Hackathon1-Copy UI + AgriSentinal crop_config.json |
| Sowing probability analysis | AgriSentinal decision engine |
| Weather data (Open-Meteo) | AgriSentinal WeatherService |
| Soil data (SoilGrids + fallback) | AgriSentinal SoilService |
| Monsoon onset analysis | AgriSentinal analysis/monsoon.py |
| AI predictor & field risk outlook | AgriSentinal analysis/ai_predictor.py |
| 30-day sowing window scoring | AgriSentinal models/decision_engine.py |
| State/district data (36 states/UTs) | AgriSentinal config/state_district.json |
| Crop config (water req., temp, etc.) | AgriSentinal config/crop_config.json |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Service health check |
| POST | `/api/sowing/analyze` | Main sowing analysis |
| GET | `/api/weather?lat=&lon=` | Weather data |
| GET | `/api/crops` | Available crops |
| GET | `/api/states` | States & districts |
