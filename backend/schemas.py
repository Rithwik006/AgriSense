from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime

# ==================== CROP SCHEMAS ====================
class CropBase(BaseModel):
    crop_name: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1, max_length=50)
    season: str = Field(..., min_length=1, max_length=50)
    area: float = Field(..., gt=0, description="Area in acres must be greater than 0")
    planting_date: str
    expected_harvest_date: str
    status: str = Field("Planned", pattern="^(Planned|Growing|Harvested|Completed)$")
    notes: Optional[str] = ""

    @field_validator("crop_name", "category", "season")
    def name_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Field cannot be empty or whitespace only")
        return v.strip()

class CropCreate(CropBase):
    pass

class CropUpdate(BaseModel):
    crop_name: Optional[str] = None
    category: Optional[str] = None
    season: Optional[str] = None
    area: Optional[float] = Field(None, gt=0)
    planting_date: Optional[str] = None
    expected_harvest_date: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(Planned|Growing|Harvested|Completed)$")
    notes: Optional[str] = None

class CropResponse(CropBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ==================== SOIL SCHEMAS ====================
class SoilAnalyzeInput(BaseModel):
    location: str = Field(..., min_length=1)
    ph: float = Field(..., ge=0.0, le=14.0, description="pH must be between 0 and 14")
    nitrogen: float = Field(..., ge=0.0, description="Nitrogen cannot be negative")
    phosphorus: float = Field(..., ge=0.0, description="Phosphorus cannot be negative")
    potassium: float = Field(..., ge=0.0, description="Potassium cannot be negative")
    moisture: float = Field(..., ge=0.0, le=100.0, description="Moisture must be between 0 and 100")

class SoilAnalysisResult(BaseModel):
    ph_condition: str
    nitrogen_condition: str
    phosphorus_condition: str
    potassium_condition: str
    moisture_condition: str
    overall_condition: str
    suggestions: List[str]

class SoilReportResponse(BaseModel):
    id: int
    location: str
    ph: float
    nitrogen: float
    phosphorus: float
    potassium: float
    moisture: float
    overall_condition: str
    analyzed_at: datetime

    class Config:
        from_attributes = True

# ==================== WEATHER SCHEMAS ====================
class WeatherFetchInput(BaseModel):
    location: str = Field(..., min_length=1)

class WeatherManualInput(BaseModel):
    location: str = Field(..., min_length=1)
    temperature: float
    humidity: float = Field(..., ge=0, le=100)
    rainfall: float = Field(..., ge=0)
    wind_speed: float = Field(..., ge=0)
    weather_description: str = Field(..., min_length=1)

class WeatherRecordResponse(BaseModel):
    id: int
    location: str
    temperature: float
    humidity: float
    rainfall: float
    wind_speed: float
    weather_description: str
    recorded_at: datetime

    class Config:
        from_attributes = True

# ==================== ADVISORY SCHEMAS ====================
class AdvisoryGenerateInput(BaseModel):
    crop_name: str = Field(..., min_length=1)
    soil_id: Optional[int] = None
    weather_id: Optional[int] = None
    manual_ph: Optional[float] = None
    manual_nitrogen: Optional[float] = None
    manual_phosphorus: Optional[float] = None
    manual_potassium: Optional[float] = None
    manual_moisture: Optional[float] = None
    manual_temperature: Optional[float] = None
    manual_rainfall: Optional[float] = None
    manual_humidity: Optional[float] = None

class AdvisoryResponse(BaseModel):
    id: int
    crop_name: str
    soil_condition: str
    weather_condition: str
    recommendation: str
    priority: str
    reason: str
    created_at: datetime

    class Config:
        from_attributes = True

# ==================== DASHBOARD & REPORT SCHEMAS ====================
class DashboardStats(BaseModel):
    total_crops: int
    active_crops: int
    soil_reports: int
    weather_records: int
    total_advisories: int
    high_priority_advisories: int
    crops_by_category: dict
    crops_by_status: dict
    recent_crops: List[CropResponse]
    recent_soil_reports: List[SoilReportResponse]
    recent_weather: List[WeatherRecordResponse]
    recent_advisories: List[AdvisoryResponse]

# ==================== AUTH SCHEMAS ====================
class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=150)
    password: str = Field(..., min_length=6, max_length=100)
    farm_name: Optional[str] = "My Farm"

    @field_validator("email")
    def email_valid(cls, v):
        clean = v.strip().lower()
        if "@" not in clean or "." not in clean:
            raise ValueError("Please provide a valid email address.")
        return clean

class UserLogin(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=1)

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    farm_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
