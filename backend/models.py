from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
from backend.database import Base

class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    crop_name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    season = Column(String(50), nullable=False)
    area = Column(Float, nullable=False)  # in acres/hectares
    planting_date = Column(String(20), nullable=False)
    expected_harvest_date = Column(String(20), nullable=False)
    status = Column(String(50), nullable=False, default="Planned")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SoilReport(Base):
    __tablename__ = "soil_reports"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String(100), nullable=False)
    ph = Column(Float, nullable=False)
    nitrogen = Column(Float, nullable=False)
    phosphorus = Column(Float, nullable=False)
    potassium = Column(Float, nullable=False)
    moisture = Column(Float, nullable=False)
    overall_condition = Column(String(100), nullable=False)
    analyzed_at = Column(DateTime, default=datetime.utcnow)

class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String(100), nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    rainfall = Column(Float, nullable=False)
    wind_speed = Column(Float, nullable=False)
    weather_description = Column(String(100), nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)

class Advisory(Base):
    __tablename__ = "advisories"

    id = Column(Integer, primary_key=True, index=True)
    crop_name = Column(String(100), nullable=False)
    soil_condition = Column(String(100), nullable=False)
    weather_condition = Column(String(100), nullable=False)
    recommendation = Column(Text, nullable=False)
    priority = Column(String(20), nullable=False)  # High, Medium, Low
    reason = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
