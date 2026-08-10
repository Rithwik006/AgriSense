# AGRI SENSE – FARMING ADVISORY SIMULATOR

A full-stack, dynamic farming management and rule-based advisory web application built with **FastAPI (Python 3)**, **SQLite (SQLAlchemy ORM)**, and a modern **React (Vite, JavaScript, Vanilla CSS)** frontend.

---

## 🌟 Features

1. **Dynamic Dashboard Analytics**: Real-time metrics calculating total crops, active crops, soil reports, weather logs, total advisories, and high-priority alerts with Chart.js visual distribution graphs.
2. **Crop Manager (Full CRUD)**:
   - Create, Read, Update, and Delete crop records.
   - Filter by Category (*Cereal, Vegetable, Fruit, Cash Crop, Pulse*), Season (*Kharif, Rabi, Zaid, Year Round*), and Status (*Planned, Growing, Harvested, Completed*).
   - Search by crop name and client-side sorting.
3. **Soil Health Analyzer**:
   - Rule-based soil classification evaluating pH levels (*Highly Acidic* to *Highly Alkaline*), NPK nutrient levels (*Low, Medium, High*), and moisture content.
   - Instant actionable suggestions for soil amendment and fertilizer recommendations saved directly to SQLite.
4. **Weather Module**:
   - Live weather lookup using free **Open-Meteo API** (geocoding + climate metrics) without requiring API keys.
   - Graceful fallback and user-friendly manual weather entry option if offline or if network issues occur.
5. **Rule-Based Advisory Engine**:
   - Agriculture decision matrix correlating crop choice, soil health, and weather variables.
   - Generates priority-rated advisories (*High, Medium, Low*) with clear recommendations and scientific justifications.
6. **Reports & Data Export**:
   - One-click export of system data using Python file utilities into `data/exports/`.
   - Formats available: **CSV** (Crops, Soil, Weather, Advisories), **JSON** (Complete dataset), and **TXT** (Structured text summary).

---

## 🏗️ Technology Stack

- **Frontend**: React.js (JavaScript), Vite, Vanilla CSS3, Axios, Chart.js / react-chartjs-2, Lucide React Icons.
- **Backend**: Python 3, FastAPI, SQLAlchemy ORM, Pydantic v2, Uvicorn, HTTPX.
- **Database**: SQLite persistent database (`data/agrisense.db`) with automatic database initialization and sample seed data.
- **API Documentation**: OpenAPI / Swagger UI at `http://127.0.0.1:8000/docs`.

---

## 📁 Project Structure

```
group pbl/
├── backend/
│   ├── main.py                # FastAPI entrypoint & auto-seeding logic
│   ├── database.py            # SQLite connection & SessionLocal
│   ├── models.py              # SQLAlchemy ORM models (Crop, SoilReport, WeatherRecord, Advisory)
│   ├── schemas.py             # Pydantic schemas with strict validation
│   ├── routers/
│   │   ├── crops.py           # Crop CRUD API endpoints
│   │   ├── soil.py            # Soil testing API endpoints
│   │   ├── weather.py         # Open-Meteo & manual weather endpoints
│   │   ├── advisory.py        # Advisory generator endpoints
│   │   └── reports.py         # Analytics & CSV/JSON/TXT export endpoints
│   ├── services/
│   │   ├── soil_analyzer.py   # Rule-based soil analysis logic
│   │   ├── weather_service.py # Open-Meteo client with fallback handling
│   │   ├── advisory_engine.py # Rule-based advisory decision matrix
│   │   └── report_service.py # Metrics calculator & export builder
│   └── utils/
│       ├── validators.py      # Field validation utilities
│       └── file_manager.py    # Python JSON, CSV, TXT file handling
├── frontend/
│   ├── src/
│   │   ├── components/        # Sidebar, Navbar, StatCard, CropTable, CropForm, etc.
│   │   ├── pages/             # Dashboard, CropManager, SoilAnalyzer, Weather, AdvisoryEngine, Reports
│   │   ├── services/
│   │   │   └── api.js         # Centralized Axios API service layer
│   │   ├── App.jsx            # Main Router setup
│   │   ├── main.jsx           # React DOM root
│   │   └── index.css          # Agriculture-themed modern CSS
│   ├── package.json
│   └── vite.config.js
├── data/
│   ├── exports/               # Generated CSV, JSON, TXT export files
│   └── agrisense.db           # SQLite persistent database
├── requirements.txt
└── README.md
```

---

## 🔌 API Endpoints Summary

### Crops (`/api/crops`)
- `GET /api/crops` – List crops with optional search, category, season, and status filters.
- `POST /api/crops` – Register a new crop.
- `GET /api/crops/{id}` – Retrieve crop by ID.
- `PUT /api/crops/{id}` – Update crop details.
- `DELETE /api/crops/{id}` – Delete crop record.

### Soil Analysis (`/api/soil`)
- `POST /api/soil/analyze` – Submit soil test values for rule-based analysis and save report.
- `GET /api/soil/reports` – Retrieve historical soil reports.
- `GET /api/soil/reports/{id}` – Retrieve specific soil report.

### Weather (`/api/weather`)
- `GET /api/weather` – List saved weather records.
- `POST /api/weather/fetch` – Query Open-Meteo live weather API for location.
- `POST /api/weather/manual` – Manually save weather record.

### Advisory Engine (`/api/advisory`)
- `POST /api/advisory/generate` – Generate rule-based recommendation for selected crop, soil, and weather inputs.
- `GET /api/advisory` – List all generated advisories.
- `GET /api/advisory/{id}` – Retrieve advisory by ID.

### Reports & Analytics (`/api/reports`)
- `GET /api/reports/dashboard` – Real-time database metrics & chart distribution counts.
- `GET /api/reports/crops/csv` – Download Crops CSV export file.
- `GET /api/reports/soil/csv` – Download Soil Reports CSV export file.
- `GET /api/reports/weather/csv` – Download Weather CSV export file.
- `GET /api/reports/advisories/csv` – Download Advisories CSV export file.
- `GET /api/reports/all/json` – Download complete system database report as JSON.
- `GET /api/reports/summary/txt` – Download formatted summary report as TXT.

---

## ⚡ How to Run the Application

### 1. Backend Setup (FastAPI)

1. Create Python virtual environment:
   ```bash
   python -m venv .venv
   ```
2. Activate virtual environment:
   - **Windows**: `.venv\Scripts\activate`
   - **macOS/Linux**: `source .venv/bin/activate`
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start FastAPI server:
   ```bash
   python -m uvicorn backend.main:app --reload
   ```
   *FastAPI server will start at:* `http://127.0.0.1:8000`  
   *Swagger API Documentation:* `http://127.0.0.1:8000/docs`

---

### 2. Frontend Setup (React + Vite)

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start Vite development server:
   ```bash
   npm run dev
   ```
   *React application will open at:* `http://localhost:5173`

---

## 🧪 Verification & Testing Checklist

- [x] Backend database auto-seeds sample crops, soil reports, weather logs, and advisories on first startup.
- [x] Dashboard metrics and Chart.js graphs load dynamically from FastAPI.
- [x] Crop Manager supports full CRUD with live search, season/category/status filters, and sorting.
- [x] Soil Analyzer runs Python rule engine, classifies pH/NPK/moisture, and saves results.
- [x] Weather module queries live Open-Meteo API and switches gracefully to manual fallback on network failure.
- [x] Advisory Engine generates priority-ranked recommendations based on crop and environmental parameters.
- [x] File exports successfully produce CSV, JSON, and TXT files in `data/exports/`.
