from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.models import Advisory, SoilReport, WeatherRecord
from backend.schemas import AdvisoryGenerateInput, AdvisoryResponse
from backend.services.advisory_engine import AdvisoryEngineService

router = APIRouter(prefix="/api/advisory", tags=["Advisory Engine"])

@router.post("/generate", response_model=AdvisoryResponse, status_code=status.HTTP_201_CREATED)
def generate_advisory(input_data: AdvisoryGenerateInput, db: Session = Depends(get_db)):
    ph, n, p, k, moist = 6.5, 30.0, 20.0, 150.0, 45.0
    temp, rain, hum = 28.0, 5.0, 60.0

    # If linked to a soil report ID
    if input_data.soil_id:
        soil = db.query(SoilReport).filter(SoilReport.id == input_data.soil_id).first()
        if soil:
            ph, n, p, k, moist = soil.ph, soil.nitrogen, soil.phosphorus, soil.potassium, soil.moisture

    # Manual soil overrides
    if input_data.manual_ph is not None: ph = input_data.manual_ph
    if input_data.manual_nitrogen is not None: n = input_data.manual_nitrogen
    if input_data.manual_phosphorus is not None: p = input_data.manual_phosphorus
    if input_data.manual_potassium is not None: k = input_data.manual_potassium
    if input_data.manual_moisture is not None: moist = input_data.manual_moisture

    # If linked to a weather record ID
    if input_data.weather_id:
        w_rec = db.query(WeatherRecord).filter(WeatherRecord.id == input_data.weather_id).first()
        if w_rec:
            temp, rain, hum = w_rec.temperature, w_rec.rainfall, w_rec.humidity

    # Manual weather overrides
    if input_data.manual_temperature is not None: temp = input_data.manual_temperature
    if input_data.manual_rainfall is not None: rain = input_data.manual_rainfall
    if input_data.manual_humidity is not None: hum = input_data.manual_humidity

    res = AdvisoryEngineService.generate_advisory(
        crop_name=input_data.crop_name,
        ph=ph, nitrogen=n, phosphorus=p, potassium=k, moisture=moist,
        temperature=temp, rainfall=rain, humidity=hum
    )

    db_advisory = Advisory(
        crop_name=res["crop_name"],
        soil_condition=res["soil_condition"],
        weather_condition=res["weather_condition"],
        recommendation=res["recommendation"],
        priority=res["priority"],
        reason=res["reason"]
    )
    db.add(db_advisory)
    db.commit()
    db.refresh(db_advisory)

    return db_advisory

@router.get("", response_model=List[AdvisoryResponse])
def get_advisories(db: Session = Depends(get_db)):
    return db.query(Advisory).order_by(Advisory.id.desc()).all()

@router.get("/{advisory_id}", response_model=AdvisoryResponse)
def get_advisory(advisory_id: int, db: Session = Depends(get_db)):
    adv = db.query(Advisory).filter(Advisory.id == advisory_id).first()
    if not adv:
        raise HTTPException(status_code=404, detail=f"Advisory with ID {advisory_id} not found.")
    return adv
