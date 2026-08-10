from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.models import SoilReport
from backend.schemas import SoilAnalyzeInput, SoilReportResponse, SoilAnalysisResult
from backend.services.soil_analyzer import SoilAnalyzerService
from backend.utils.validators import validate_soil_input

router = APIRouter(prefix="/api/soil", tags=["Soil Analysis"])

@router.post("/analyze", status_code=status.HTTP_201_CREATED)
def analyze_soil(soil_in: SoilAnalyzeInput, db: Session = Depends(get_db)):
    errs = validate_soil_input(soil_in.ph, soil_in.nitrogen, soil_in.phosphorus, soil_in.potassium, soil_in.moisture)
    if errs:
        raise HTTPException(status_code=400, detail="; ".join(errs))

    analysis = SoilAnalyzerService.analyze(
        ph=soil_in.ph,
        nitrogen=soil_in.nitrogen,
        phosphorus=soil_in.phosphorus,
        potassium=soil_in.potassium,
        moisture=soil_in.moisture
    )

    db_report = SoilReport(
        location=soil_in.location,
        ph=soil_in.ph,
        nitrogen=soil_in.nitrogen,
        phosphorus=soil_in.phosphorus,
        potassium=soil_in.potassium,
        moisture=soil_in.moisture,
        overall_condition=analysis["overall_condition"]
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    return {
        "report": SoilReportResponse.model_validate(db_report),
        "analysis": analysis
    }

@router.get("/reports", response_model=List[SoilReportResponse])
def get_soil_reports(db: Session = Depends(get_db)):
    return db.query(SoilReport).order_by(SoilReport.id.desc()).all()

@router.get("/reports/{report_id}", response_model=SoilReportResponse)
def get_soil_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(SoilReport).filter(SoilReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail=f"Soil report with ID {report_id} not found.")
    return report
