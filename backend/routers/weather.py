from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.models import WeatherRecord
from backend.schemas import WeatherFetchInput, WeatherManualInput, WeatherRecordResponse
from backend.services.weather_service import WeatherService

router = APIRouter(prefix="/api/weather", tags=["Weather"])

@router.get("", response_model=List[WeatherRecordResponse])
def get_weather_records(db: Session = Depends(get_db)):
    return db.query(WeatherRecord).order_by(WeatherRecord.id.desc()).all()

@router.post("/fetch", status_code=status.HTTP_201_CREATED)
async def fetch_weather(w_input: WeatherFetchInput, db: Session = Depends(get_db)):
    data = await WeatherService.fetch_live_weather(w_input.location)
    
    db_record = WeatherRecord(
        location=data["location"],
        temperature=data["temperature"],
        humidity=data["humidity"],
        rainfall=data["rainfall"],
        wind_speed=data["wind_speed"],
        weather_description=data["weather_description"]
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    return {
        "record": WeatherRecordResponse.model_validate(db_record),
        "is_fallback": data.get("is_fallback", False)
    }

@router.post("/manual", response_model=WeatherRecordResponse, status_code=status.HTTP_201_CREATED)
def record_manual_weather(manual_in: WeatherManualInput, db: Session = Depends(get_db)):
    db_record = WeatherRecord(
        location=manual_in.location,
        temperature=manual_in.temperature,
        humidity=manual_in.humidity,
        rainfall=manual_in.rainfall,
        wind_speed=manual_in.wind_speed,
        weather_description=manual_in.weather_description
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record
