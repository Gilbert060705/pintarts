from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import schemas, crud

router = APIRouter(prefix="/recommend", tags=["Recommendations"])

@router.get("/search", response_model=List[schemas.PaintingResponse])
def search_bar(
    query: str, 
    user_id: Optional[str] = Query(None, description="User ID to check wishlist status"),
    db: Session = Depends(get_db)
):
    paintings = crud.search_paintings_by_description(db, query, user_id)
    if not paintings:
        raise HTTPException(status_code=404, detail="No paintings found matching the query")
    return paintings

@router.get("/{user_id}", response_model=List[schemas.PaintingResponse])
def recommend_paintings(user_id: str, db: Session = Depends(get_db)):
    paintings = crud.get_recommmendations_for_user(db, user_id)
    if not paintings:
        raise HTTPException(status_code=404, detail="User not found or no preferences set")
    return paintings