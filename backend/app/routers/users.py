from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import schemas, crud

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=List[schemas.UserListItem])
def get_all_users(
    user_id: Optional[str] = Query(None, description="User ID to exclude and calculate similarity from"),
    db: Session = Depends(get_db)
):
    """Get all users in the system. If user_id is provided, excludes that user and calculates taste similarity."""
    try:
        users = crud.get_all_users(db, user_id)
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving users: {str(e)}")

@router.post("", response_model=schemas.UserResponse)
def onboard_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        result = crud.create_user(db=db, user=user)
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create user")
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating user: {str(e)}")

@router.post("/login", response_model=schemas.LoginResponse)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user_id = crud.get_user_by_credentials(db, credentials.username, credentials.password)
    
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    return schemas.LoginResponse(
        success=True,
        user_id=user_id,
        message="Login successful"
    )

@router.put("/{user_id}/taste-profile", response_model=schemas.TasteProfileResponse)
def update_taste_profile(
    user_id: str, 
    taste_update: schemas.TasteProfileUpdate, 
    db: Session = Depends(get_db)
):
    try:
        result = crud.update_user_taste_profile(db, user_id, taste_update.preferences)
        
        if result is None:
            raise HTTPException(status_code=404, detail="User not found")
        
        return schemas.TasteProfileResponse(
            success=True,
            user_id=user_id,
            message="Taste profile updated successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error updating taste profile: {str(e)}")

