from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(60), unique=True, index=True, nullable=False) # custom user ID/handle
    gmail = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    shelved_books = relationship("ShelvedBook", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")


class ShelvedBook(Base):
    __tablename__ = "shelved_books"
    __table_args__ = (
        UniqueConstraint('user_id', 'book_id', name='uq_user_book'),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    book_id = Column(String(100), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    authors = Column(String(255), default="")
    cover_image = Column(Text, default="")
    description = Column(Text, default="")
    status = Column(String(50), nullable=False, default="want_to_read") # 'want_to_read', 'reading', 'read'
    user_rating = Column(Integer, nullable=True) # 1 - 5
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="shelved_books")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    book_id = Column(String(100), index=True, nullable=False)
    book_title = Column(String(255), nullable=False)
    book_cover = Column(Text, default="")
    rating = Column(Integer, nullable=False) # 1 to 5
    review_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="reviews")

