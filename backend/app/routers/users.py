from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import schemas, crud

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=schemas.UserResponse)
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

