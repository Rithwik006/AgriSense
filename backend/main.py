from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from backend.database import engine, Base, SessionLocal
from backend.models import Crop, SoilReport, WeatherRecord, Advisory
from backend.routers import crops, soil, weather, advisory, reports

app = FastAPI(
    title="AgriSense – Farming Advisory Simulator API",
    description="Full-stack FastAPI backend for Crop Management, Soil Analysis, Weather Monitoring, and Rule-based Farming Advisories.",
    version="1.0.0"
)

# CORS configuration to allow React dev server access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows http://localhost:5173 and all dev clients
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(crops.router)
app.include_router(soil.router)
app.include_router(weather.router)
app.include_router(advisory.router)
app.include_router(reports.router)

@app.on_event("startup")
def startup_db_init():
    """Initializes database schema and populates seed sample data if empty."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Crop).count() == 0:
            sample_crops = [
                Crop(crop_name="Rice", category="Cereal", season="Kharif", area=12.5, planting_date="2026-06-15", expected_harvest_date="2026-10-20", status="Growing", notes="High yield variety Paddy field."),
                Crop(crop_name="Wheat", category="Cereal", season="Rabi", area=8.0, planting_date="2025-11-10", expected_harvest_date="2026-03-25", status="Harvested", notes="Irrigated field with NPK 20-20-0."),
                Crop(crop_name="Tomato", category="Vegetable", season="Zaid", area=3.5, planting_date="2026-02-01", expected_harvest_date="2026-05-15", status="Completed", notes="Drip irrigation tomato garden."),
                Crop(crop_name="Cotton", category="Cash Crop", season="Kharif", area=15.0, planting_date="2026-05-20", expected_harvest_date="2026-11-30", status="Growing", notes="BT Cotton variety with pest monitoring."),
                Crop(crop_name="Maize", category="Pulse", season="Year Round", area=6.0, planting_date="2026-07-01", expected_harvest_date="2026-10-15", status="Planned", notes="Planned for silage production.")
            ]
            db.add_all(sample_crops)

        if db.query(SoilReport).count() == 0:
            sample_soil = [
                SoilReport(location="North Field Sector A", ph=6.2, nitrogen=35.0, phosphorus=22.0, potassium=180.0, moisture=48.0, overall_condition="Optimal Fertility"),
                SoilReport(location="South Hill Plot 3", ph=5.1, nitrogen=14.0, phosphorus=10.0, potassium=85.0, moisture=22.0, overall_condition="Poor / Deficient Soil")
            ]
            db.add_all(sample_soil)

        if db.query(WeatherRecord).count() == 0:
            sample_weather = [
                WeatherRecord(location="Punjab Farming Zone", temperature=29.4, humidity=62.0, rainfall=4.5, wind_speed=11.2, weather_description="Partly Cloudy"),
                WeatherRecord(location="Central Valley", temperature=36.8, humidity=42.0, rainfall=0.0, wind_speed=15.0, weather_description="Hot & Dry")
            ]
            db.add_all(sample_weather)

        if db.query(Advisory).count() == 0:
            sample_advisories = [
                Advisory(
                    crop_name="Cotton",
                    soil_condition="pH 5.1 | N:14.0 P:10.0 K:85.0 | Moist:22.0%",
                    weather_condition="Temp 36.8°C | Rain 0.0mm | Hum 42.0%",
                    recommendation="Apply agricultural lime to boost acidic pH. Increase drip irrigation immediately and add Urea.",
                    priority="High",
                    reason="Soil pH of 5.1 is highly acidic. Nitrogen and moisture levels are critically low under heat stress."
                ),
                Advisory(
                    crop_name="Rice",
                    soil_condition="pH 6.2 | N:35.0 P:22.0 K:180.0 | Moist:48.0%",
                    weather_condition="Temp 29.4°C | Rain 4.5mm | Hum 62.0%",
                    recommendation="Maintain standing water depth of 2-5 cm. Soil nutrients are well balanced.",
                    priority="Low",
                    reason="Optimal fertility and balanced microclimate."
                )
            ]
            db.add_all(sample_advisories)

        db.commit()
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "app": "AGRI SENSE – FARMING ADVISORY SIMULATOR",
        "status": "Online",
        "docs": "/docs",
        "backend": "FastAPI",
        "database": "SQLite"
    }
