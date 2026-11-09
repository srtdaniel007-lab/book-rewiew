from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
import re

class UserRegister(BaseModel):
    user_id: str = Field(..., min_length=3, max_length=50, description="Unique username / user id")
    gmail: str = Field(..., description="Must end with @gmail.com")
    password: str = Field(..., min_length=8, description="Minimum 8 characters")

    @field_validator("gmail")
    @classmethod
    def validate_gmail(cls, v: str) -> str:
        clean = v.strip().lower()
        if not clean.endswith("@gmail.com"):
            raise ValueError("Email must end with @gmail.com")
        # Validate format before @gmail.com
        prefix = clean[:-10]
        if not prefix or not re.match(r"^[a-zA-Z0-9._%+-]+$", prefix):
            raise ValueError("Invalid Gmail username format")
        return clean

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v

    @field_validator("user_id")
    @classmethod
    def validate_user_id(cls, v: str) -> str:
        clean = v.strip()
        if len(clean) < 3:
            raise ValueError("User ID must be at least 3 characters long")
        if not re.match(r"^[a-zA-Z0-9_-]+$", clean):
            raise ValueError("User ID can only contain letters, numbers, underscores, and dashes")
        return clean


class UserLogin(BaseModel):
    gmail_or_user_id: str
    password: str


class UserOut(BaseModel):
    id: int
    user_id: str
    gmail: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ShelfUpdate(BaseModel):
    book_id: str
    title: str
    authors: Optional[str] = ""
    cover_image: Optional[str] = ""
    description: Optional[str] = ""
    status: str = Field(..., description="want_to_read, reading, or read")
    user_rating: Optional[int] = Field(None, ge=1, le=5)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"want_to_read", "reading", "read"}
        if v not in allowed:
            raise ValueError(f"Status must be one of: {allowed}")
        return v


class ShelvedBookOut(BaseModel):
    id: int
    user_id: int
    book_id: str
    title: str
    authors: Optional[str]
    cover_image: Optional[str]
    description: Optional[str]
    status: str
    user_rating: Optional[int]
    updated_at: datetime

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    book_id: str
    book_title: str
    book_cover: Optional[str] = ""
    rating: int = Field(..., ge=1, le=5)
    review_text: str = Field(..., min_length=3, max_length=5000)


class ReviewOut(BaseModel):
    id: int
    user_id: int
    book_id: str
    book_title: str
    book_cover: Optional[str]
    rating: int
    review_text: str
    created_at: datetime
    author_name: Optional[str] = None
    author_gmail: Optional[str] = None

    class Config:
        from_attributes = True


# Book API Schema (for open source search results)
class BookItem(BaseModel):
    id: str
    title: str
    authors: List[str] = []
    description: Optional[str] = ""
    cover_image: Optional[str] = ""
    published_year: Optional[str] = ""
    page_count: Optional[int] = None
    average_rating: Optional[float] = None
    ratings_count: Optional[int] = None
    categories: List[str] = []

