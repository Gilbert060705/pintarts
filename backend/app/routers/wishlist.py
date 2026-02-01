from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import schemas, crud

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

@router.post("/", response_model=schemas.WishlistResponse)
def add_to_wishlist(wishlist: schemas.WishlistAdd, db: Session = Depends(get_db)):
    """Add a painting to user's wishlist"""
    try:
        crud.add_to_wishlist(db, wishlist.user_id, wishlist.painting_id)
        return schemas.WishlistResponse(
            success=True,
            message="Painting added to wishlist"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[schemas.PaintingResponse])
def get_wishlist(user_id: str = Query(..., description="User ID"), db: Session = Depends(get_db)):
    """Get all paintings in user's wishlist"""
    try:
        paintings = crud.get_user_wishlist(db, user_id)
        return paintings
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/", response_model=schemas.WishlistResponse)
def remove_from_wishlist(wishlist: schemas.WishlistAdd, db: Session = Depends(get_db)):
    """Remove a painting from user's wishlist"""
    try:
        removed = crud.remove_from_wishlist(db, wishlist.user_id, wishlist.painting_id)
        if not removed:
            raise HTTPException(status_code=404, detail="Painting not found in wishlist")
        return schemas.WishlistResponse(
            success=True,
            message="Painting removed from wishlist"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
