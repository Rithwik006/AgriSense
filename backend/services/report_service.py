from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import Dict, Any, List

from backend.models import Crop, SoilReport, WeatherRecord, Advisory
from backend.utils.file_manager import FileManager

class ReportService:
    @staticmethod
    def get_dashboard_metrics(db: Session) -> Dict[str, Any]:
        total_crops = db.query(Crop).count()
        active_crops = db.query(Crop).filter(Crop.status.in_(["Planned", "Growing"])).count()
        soil_reports_count = db.query(SoilReport).count()
        weather_records_count = db.query(WeatherRecord).count()
        total_advisories = db.query(Advisories := Advisory).count()
        high_priority_advisories = db.query(Advisory).filter(Advisory.priority == "High").count()

        # Crop category breakdown
        cats = db.query(Crop.category, func.count(Crop.id)).group_by(Crop.category).all()
        crops_by_category = {cat: count for cat, count in cats}

        # Crop status breakdown
        statuses = db.query(Crop.status, func.count(Crop.id)).group_by(Crop.status).all()
        crops_by_status = {status: count for status, count in statuses}

        # Recent records
        recent_crops = db.query(Crop).order_by(Crop.id.desc()).limit(5).all()
        recent_soil = db.query(SoilReport).order_by(SoilReport.id.desc()).limit(5).all()
        recent_weather = db.query(WeatherRecord).order_by(WeatherRecord.id.desc()).limit(5).all()
        recent_advisories = db.query(Advisory).order_by(Advisory.id.desc()).limit(5).all()

        return {
            "total_crops": total_crops,
            "active_crops": active_crops,
            "soil_reports": soil_reports_count,
            "weather_records": weather_records_count,
            "total_advisories": total_advisories,
            "high_priority_advisories": high_priority_advisories,
            "crops_by_category": crops_by_category,
            "crops_by_status": crops_by_status,
            "recent_crops": recent_crops,
            "recent_soil_reports": recent_soil,
            "recent_weather": recent_weather,
            "recent_advisories": recent_advisories
        }

    @staticmethod
    def export_crops_csv(db: Session) -> str:
        crops = db.query(Crop).all()
        fieldnames = ["id", "crop_name", "category", "season", "area", "planting_date", "expected_harvest_date", "status", "notes", "created_at"]
        rows = [
            {
                "id": c.id,
                "crop_name": c.crop_name,
                "category": c.category,
                "season": c.season,
                "area": c.area,
                "planting_date": c.planting_date,
                "expected_harvest_date": c.expected_harvest_date,
                "status": c.status,
                "notes": c.notes or "",
                "created_at": c.created_at.isoformat() if c.created_at else ""
            }
            for c in crops
        ]
        return FileManager.write_csv("crops_export.csv", fieldnames, rows)

    @staticmethod
    def export_soil_csv(db: Session) -> str:
        reports = db.query(SoilReport).all()
        fieldnames = ["id", "location", "ph", "nitrogen", "phosphorus", "potassium", "moisture", "overall_condition", "analyzed_at"]
        rows = [
            {
                "id": r.id,
                "location": r.location,
                "ph": r.ph,
                "nitrogen": r.nitrogen,
                "phosphorus": r.phosphorus,
                "potassium": r.potassium,
                "moisture": r.moisture,
                "overall_condition": r.overall_condition,
                "analyzed_at": r.analyzed_at.isoformat() if r.analyzed_at else ""
            }
            for r in reports
        ]
        return FileManager.write_csv("soil_reports_export.csv", fieldnames, rows)

    @staticmethod
    def export_weather_csv(db: Session) -> str:
        records = db.query(WeatherRecord).all()
        fieldnames = ["id", "location", "temperature", "humidity", "rainfall", "wind_speed", "weather_description", "recorded_at"]
        rows = [
            {
                "id": w.id,
                "location": w.location,
                "temperature": w.temperature,
                "humidity": w.humidity,
                "rainfall": w.rainfall,
                "wind_speed": w.wind_speed,
                "weather_description": w.weather_description,
                "recorded_at": w.recorded_at.isoformat() if w.recorded_at else ""
            }
            for w in records
        ]
        return FileManager.write_csv("weather_records_export.csv", fieldnames, rows)

    @staticmethod
    def export_advisories_csv(db: Session) -> str:
        advisories = db.query(Advisory).all()
        fieldnames = ["id", "crop_name", "soil_condition", "weather_condition", "recommendation", "priority", "reason", "created_at"]
        rows = [
            {
                "id": a.id,
                "crop_name": a.crop_name,
                "soil_condition": a.soil_condition,
                "weather_condition": a.weather_condition,
                "recommendation": a.recommendation,
                "priority": a.priority,
                "reason": a.reason,
                "created_at": a.created_at.isoformat() if a.created_at else ""
            }
            for a in advisories
        ]
        return FileManager.write_csv("advisories_export.csv", fieldnames, rows)

    @staticmethod
    def export_all_json(db: Session) -> str:
        crops = [c.__dict__ for c in db.query(Crop).all()]
        soil = [s.__dict__ for s in db.query(SoilReport).all()]
        weather = [w.__dict__ for w in db.query(WeatherRecord).all()]
        advisories = [a.__dict__ for a in db.query(Advisory).all()]

        # clean internal _sa_instance_state
        for dataset in [crops, soil, weather, advisories]:
            for item in dataset:
                item.pop("_sa_instance_state", None)

        export_data = {
            "app": "AgriSense – Farming Advisory Simulator",
            "generated_at": datetime.utcnow().isoformat(),
            "summary": ReportService.get_dashboard_metrics(db),
            "crops": crops,
            "soil_reports": soil,
            "weather_records": weather,
            "advisories": advisories
        }

        # Use FileManager json writer
        return FileManager.write_json("complete_agrisense_report.json", export_data)

    @staticmethod
    def export_summary_txt(db: Session) -> str:
        metrics = ReportService.get_dashboard_metrics(db)
        content = f"""==================================================
AGRI SENSE – FARMING ADVISORY SUMMARY REPORT
==================================================
Generated At: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}

1. SYSTEM OVERVIEW
--------------------------------------------------
Total Crops Managed:       {metrics['total_crops']}
Active Crops (Planned/Growing): {metrics['active_crops']}
Soil Analyses Conducted:   {metrics['soil_reports']}
Weather Log Records:       {metrics['weather_records']}
Total Advisories Generated:{metrics['total_advisories']}
High Priority Advisories:  {metrics['high_priority_advisories']}

2. CROPS DISTRIBUTION BY CATEGORY
--------------------------------------------------
"""
        for cat, count in metrics['crops_by_category'].items():
            content += f"- {cat}: {count}\n"

        content += "\n3. CROPS STATUS BREAKDOWN\n--------------------------------------------------\n"
        for st, count in metrics['crops_by_status'].items():
            content += f"- {st}: {count}\n"

        content += "\n==================================================\nEnd of Summary Report\n==================================================\n"
        return FileManager.write_txt("agrisense_summary.txt", content)
