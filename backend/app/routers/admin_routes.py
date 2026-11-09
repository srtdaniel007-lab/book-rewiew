from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

router = APIRouter(prefix="/api/database", tags=["PostgreSQL Database Viewer"])

@router.get("/tables")
def get_database_tables(db: Session = Depends(get_db)):
    """
    Returns live inspection data from PostgreSQL:
    - Tables: users, shelved_books, reviews
    - Columns, types, and actual records
    Allows users to see their PostgreSQL database tables right in the dynamic web UI!
    """
    tables_data = {}

    # 1. Users table
    users_sql = text("SELECT id, user_id, gmail, password_hash, created_at FROM users ORDER BY id ASC")
    user_rows = db.execute(users_sql).mappings().all()
    tables_data["users"] = {
        "columns": ["id", "user_id", "gmail", "password_hash (bcrypt)", "created_at"],
        "count": len(user_rows),
        "rows": [
            {
                "id": r["id"],
                "user_id": r["user_id"],
                "gmail": r["gmail"],
                "password_hash (bcrypt)": (r["password_hash"][:15] + "..." if r["password_hash"] else ""),
                "created_at": str(r["created_at"]) if r["created_at"] else ""
            }
            for r in user_rows
        ]
    }

    # 2. Shelved Books table
    shelves_sql = text("SELECT id, user_id, book_id, title, status, user_rating, updated_at FROM shelved_books ORDER BY id DESC")
    shelf_rows = db.execute(shelves_sql).mappings().all()
    tables_data["shelved_books"] = {
        "columns": ["id", "user_id", "book_id", "title", "status", "user_rating", "updated_at"],
        "count": len(shelf_rows),
        "rows": [
            {
                "id": r["id"],
                "user_id": r["user_id"],
                "book_id": r["book_id"],
                "title": r["title"],
                "status": r["status"],
                "user_rating": r["user_rating"],
                "updated_at": str(r["updated_at"]) if r["updated_at"] else ""
            }
            for r in shelf_rows
        ]
    }

    # 3. Reviews table
    reviews_sql = text("SELECT id, user_id, book_id, book_title, rating, review_text, created_at FROM reviews ORDER BY id DESC")
    rev_rows = db.execute(reviews_sql).mappings().all()
    tables_data["reviews"] = {
        "columns": ["id", "user_id", "book_id", "book_title", "rating", "review_text", "created_at"],
        "count": len(rev_rows),
        "rows": [
            {
                "id": r["id"],
                "user_id": r["user_id"],
                "book_id": r["book_id"],
                "book_title": r["book_title"],
                "rating": r["rating"],
                "review_text": r["review_text"],
                "created_at": str(r["created_at"]) if r["created_at"] else ""
            }
            for r in rev_rows
        ]
    }

    return {
        "database_name": "book_review",
        "database_engine": "PostgreSQL 18",
        "tables": tables_data
    }

