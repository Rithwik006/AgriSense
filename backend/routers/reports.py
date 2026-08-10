from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.schemas import DashboardStats
from backend.services.report_service import ReportService

router = APIRouter(prefix="/api/reports", tags=["Reports & Analytics"])

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_data(db: Session = Depends(get_db)):
    return ReportService.get_dashboard_metrics(db)

@router.get("/crops/csv")
def export_crops_csv(db: Session = Depends(get_db)):
    filepath = ReportService.export_crops_csv(db)
    return FileResponse(filepath, media_type="text/csv", filename="agrisense_crops.csv")

@router.get("/soil/csv")
def export_soil_csv(db: Session = Depends(get_db)):
    filepath = ReportService.export_soil_csv(db)
    return FileResponse(filepath, media_type="text/csv", filename="agrisense_soil_reports.csv")

@router.get("/weather/csv")
def export_weather_csv(db: Session = Depends(get_db)):
    filepath = ReportService.export_weather_csv(db)
    return FileResponse(filepath, media_type="text/csv", filename="agrisense_weather_records.csv")

@router.get("/advisories/csv")
def export_advisories_csv(db: Session = Depends(get_db)):
    filepath = ReportService.export_advisories_csv(db)
    return FileResponse(filepath, media_type="text/csv", filename="agrisense_advisories.csv")

@router.get("/all/json")
def export_all_json(db: Session = Depends(get_db)):
    filepath = ReportService.export_all_json(db)
    return FileResponse(filepath, media_type="application/json", filename="agrisense_full_report.json")

@router.get("/summary/txt")
def export_summary_txt(db: Session = Depends(get_db)):
    filepath = ReportService.export_summary_txt(db)
    return FileResponse(filepath, media_type="text/plain", filename="agrisense_summary_report.txt")
