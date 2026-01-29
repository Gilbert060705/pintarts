from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    preferences: List[str]

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

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
    id: int
    title: str
    artist: Optional[str] = None
    image_url: str
    style: Optional[str]

    class Config:
        from_attributes = True

class WishlistAdd(BaseModel):
    user_id: str
    painting_id: str

class WishlistResponse(BaseModel):
    success: bool
    message: str