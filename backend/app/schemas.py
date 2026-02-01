from pydantic import BaseModel, EmailStr
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    preferences: List[str]

class UserResponse(BaseModel):
    id: UUID
    username: str
    email: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    user_id: str
    message: str

class PaintingResponse(BaseModel):
    id: UUID
    title: str
    artist: Optional[str] = None
    image_url: str
    style: Optional[str] = None
    description: Optional[str] = None
    is_wishlisted: bool = False

    class Config:
        from_attributes = True

class WishlistAdd(BaseModel):
    user_id: str
    painting_id: str

class WishlistResponse(BaseModel):
    success: bool
    message: str

class TasteProfileUpdate(BaseModel):
    preferences: List[str]

class TasteProfileResponse(BaseModel):
    success: bool
    user_id: str
    message: str

class UserListItem(BaseModel):
    username: str
    email: str