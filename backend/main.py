import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from sqlalchemy import text
from backend.database import engine, Base, SessionLocal
from backend.models import Crop, SoilReport, WeatherRecord, Advisory, User
from backend.routers import crops, soil, weather, advisory, reports, auth
from backend.services.auth_service import AuthService

def startup_db_init():
    """Initializes database schema and populates seed sample data if empty."""
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS uq_users_lower_email ON users(LOWER(email));"))
        conn.commit()
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

        if db.query(User).count() == 0:
            demo_user = User(
                full_name="Rithwik Goud",
                email="demo@agrisense.com",
                hashed_password=AuthService.hash_password("password123"),
                farm_name="AgriSense Pioneer Farm"
            )
            db.add(demo_user)

        db.commit()
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    startup_db_init()
    yield

app = FastAPI(
    title="AgriSense – Farming Advisory Simulator API",
    description="Full-stack FastAPI backend for Crop Management, Soil Analysis, Weather Monitoring, and Rule-based Farming Advisories.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
cors_origins_env = os.getenv("CORS_ORIGINS", "")
if cors_origins_env:
    allowed_origins = [orig.strip() for orig in cors_origins_env.split(",") if orig.strip()]
    allow_creds = True
else:
    allowed_origins = ["*"]
    allow_creds = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_creds,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(crops.router)
app.include_router(soil.router)
app.include_router(weather.router)
app.include_router(advisory.router)
app.include_router(reports.router)

# Mount static frontend if dist exists
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIST = os.path.join(BASE_DIR, "frontend", "dist")

if os.path.exists(FRONTEND_DIST):
    assets_path = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path in ["docs", "openapi.json", "redoc"]:
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "app": "AGRI SENSE – FARMING ADVISORY SIMULATOR",
            "status": "Online",
            "docs": "/docs",
            "backend": "FastAPI",
            "database": "SQLite"
        }
