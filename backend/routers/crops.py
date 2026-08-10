from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.database import get_db
from backend.models import Crop
from backend.schemas import CropCreate, CropUpdate, CropResponse
from backend.utils.validators import validate_crop_dates

router = APIRouter(prefix="/api/crops", tags=["Crops"])

@router.get("", response_model=List[CropResponse])
def get_crops(
    search: Optional[str] = None,
    category: Optional[str] = None,
    season: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(Crop)
    if search:
        query = query.filter(Crop.crop_name.ilike(f"%{search.strip()}%"))
    if category:
        query = query.filter(Crop.category == category)
    if season:
        query = query.filter(Crop.season == season)
    if status_filter:
        query = query.filter(Crop.status == status_filter)
    
    return query.order_by(Crop.id.desc()).all()

@router.post("", response_model=CropResponse, status_code=status.HTTP_201_CREATED)
def create_crop(crop_in: CropCreate, db: Session = Depends(get_db)):
    date_err = validate_crop_dates(crop_in.planting_date, crop_in.expected_harvest_date)
    if date_err:
        raise HTTPException(status_code=400, detail=date_err)

    db_crop = Crop(**crop_in.model_dump())
    db.add(db_crop)
    db.commit()
    db.refresh(db_crop)
    return db_crop

@router.get("/{crop_id}", response_model=CropResponse)
def get_crop(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail=f"Crop with ID {crop_id} not found.")
    return crop

@router.put("/{crop_id}", response_model=CropResponse)
def update_crop(crop_id: int, crop_in: CropUpdate, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail=f"Crop with ID {crop_id} not found.")

    update_data = crop_in.model_dump(exclude_unset=True)
    p_date = update_data.get("planting_date", crop.planting_date)
    h_date = update_data.get("expected_harvest_date", crop.expected_harvest_date)
    date_err = validate_crop_dates(p_date, h_date)
    if date_err:
        raise HTTPException(status_code=400, detail=date_err)

    for field, val in update_data.items():
        setattr(crop, field, val)

    db.commit()
    db.refresh(crop)
    return crop

@router.delete("/{crop_id}", status_code=status.HTTP_200_OK)
def delete_crop(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail=f"Crop with ID {crop_id} not found.")

    db.delete(crop)
    db.commit()
    return {"message": f"Crop '{crop.crop_name}' (ID: {crop_id}) deleted successfully."}
