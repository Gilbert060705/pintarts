from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import schemas, crud
import uuid

router = APIRouter(prefix="/blend", tags=["Blending Users"])

@router.get("/my-blends/{user_id}")
def get_user_blends(user_id: uuid.UUID, db: Session = Depends(get_db)):
    blends = crud.get_blends(db, user_id)
    if not blends:
        return {"message": "No blends found for this user", "blends": []}
    return {"message": "Blends retrieved successfully", "blends": blends}

@router.get("/{blend_id}/paintings", response_model=List[schemas.PaintingResponse])
def get_blend_recommendations(blend_id: uuid.UUID, db: Session = Depends(get_db)):
    paintings = crud.get_blend_recommendations(db, blend_id)
    if not paintings:
        raise HTTPException(status_code=404, detail="Blend not found or no recommendations available")
    return paintings

@router.post("/")
def create_blend(user_1_id: uuid.UUID, user_2_id: uuid.UUID, db: Session = Depends(get_db)):
    blend_id = crud.create_user_blend(db, user_1_id, user_2_id)
    if blend_id is None:
        raise HTTPException(status_code=400, detail="Could not create blend. One or both users may not exist.")
    return {"success": True, "message": "Blend created successfully", "blend_id": str(blend_id)}