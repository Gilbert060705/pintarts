from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import schemas, crud

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

@router.post("/", response_model=schemas.WishlistResponse)
def toggle_wishlist(wishlist: schemas.WishlistAdd, db: Session = Depends(get_db)):
    """Toggle a painting in user's wishlist - adds if not present, removes if present"""
    try:
        is_wishlisted = crud.toggle_wishlist(db, wishlist.user_id, wishlist.painting_id)
        message = "Painting added to wishlist" if is_wishlisted else "Painting removed from wishlist"
        return schemas.WishlistResponse(
            success=True,
            message=message,
            is_wishlisted=is_wishlisted
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
