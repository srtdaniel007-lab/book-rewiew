from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, ShelvedBook, Review
from app.schemas import ShelfUpdate, ShelvedBookOut, ReviewCreate, ReviewOut
from app.auth import get_current_user, get_current_user_optional

router = APIRouter(prefix="/api", tags=["User Shelves & Reviews"])

# ----------------- SHELVES ENDPOINTS -----------------

@router.get("/shelves", response_model=List[ShelvedBookOut])
def get_user_shelves(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves all books on the authenticated user's shelves.
    Filterable by status: want_to_read, reading, read
    """
    query = db.query(ShelvedBook).filter(ShelvedBook.user_id == current_user.id)
    if status_filter:
        query = query.filter(ShelvedBook.status == status_filter)
    
    return query.order_by(ShelvedBook.updated_at.desc()).all()


@router.post("/shelves", response_model=ShelvedBookOut)
def add_or_update_shelf(
    shelf_data: ShelfUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Adds or updates a book on the user's shelf (want_to_read, reading, read)
    and optional 1-5 star user rating.
    """
    existing = db.query(ShelvedBook).filter(
        ShelvedBook.user_id == current_user.id,
        ShelvedBook.book_id == shelf_data.book_id
    ).first()

    if existing:
        existing.status = shelf_data.status
        if shelf_data.user_rating is not None:
            existing.user_rating = shelf_data.user_rating
        if shelf_data.title:
            existing.title = shelf_data.title
        if shelf_data.authors:
            existing.authors = shelf_data.authors
        if shelf_data.cover_image:
            existing.cover_image = shelf_data.cover_image
        if shelf_data.description:
            existing.description = shelf_data.description
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_shelf = ShelvedBook(
            user_id=current_user.id,
            book_id=shelf_data.book_id,
            title=shelf_data.title,
            authors=shelf_data.authors or "",
            cover_image=shelf_data.cover_image or "",
            description=shelf_data.description or "",
            status=shelf_data.status,
            user_rating=shelf_data.user_rating
        )
        db.add(new_shelf)
        db.commit()
        db.refresh(new_shelf)
        return new_shelf


@router.delete("/shelves/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_shelf(
    book_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Removes a book from the user's shelf."""
    entry = db.query(ShelvedBook).filter(
        ShelvedBook.user_id == current_user.id,
        ShelvedBook.book_id == book_id
    ).first()

    if not entry:
        raise HTTPException(status_code=404, detail="Book not found on your shelf")

    db.delete(entry)
    db.commit()
    return None


# ----------------- REVIEWS ENDPOINTS -----------------

@router.post("/reviews", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a new book review with star rating (1-5) and description/text.
    Also automatically adds/syncs book to the user's 'read' shelf with this rating!
    """
    new_review = Review(
        user_id=current_user.id,
        book_id=review_in.book_id,
        book_title=review_in.book_title,
        book_cover=review_in.book_cover or "",
        rating=review_in.rating,
        review_text=review_in.review_text
    )
    db.add(new_review)

    # Sync shelf rating
    shelf_entry = db.query(ShelvedBook).filter(
        ShelvedBook.user_id == current_user.id,
        ShelvedBook.book_id == review_in.book_id
    ).first()

    if shelf_entry:
        shelf_entry.user_rating = review_in.rating
        shelf_entry.status = "read" # reviewed books are read
    else:
        new_shelf = ShelvedBook(
            user_id=current_user.id,
            book_id=review_in.book_id,
            title=review_in.book_title,
            cover_image=review_in.book_cover or "",
            status="read",
            user_rating=review_in.rating
        )
        db.add(new_shelf)

    db.commit()
    db.refresh(new_review)

    return ReviewOut(
        id=new_review.id,
        user_id=new_review.user_id,
        book_id=new_review.book_id,
        book_title=new_review.book_title,
        book_cover=new_review.book_cover,
        rating=new_review.rating,
        review_text=new_review.review_text,
        created_at=new_review.created_at,
        author_name=current_user.user_id,
        author_gmail=current_user.gmail
    )


@router.get("/reviews/book/{book_id}", response_model=List[ReviewOut])
def get_book_reviews(book_id: str, db: Session = Depends(get_db)):
    """
    Retrieves all community reviews for a given book.
    """
    reviews = db.query(Review).filter(Review.book_id == book_id).order_by(Review.created_at.desc()).all()
    results = []
    for r in reviews:
        results.append(
            ReviewOut(
                id=r.id,
                user_id=r.user_id,
                book_id=r.book_id,
                book_title=r.book_title,
                book_cover=r.book_cover,
                rating=r.rating,
                review_text=r.review_text,
                created_at=r.created_at,
                author_name=r.user.user_id if r.user else "Anonymous Reader",
                author_gmail=r.user.gmail if r.user else ""
            )
        )
    return results


@router.get("/reviews/my", response_model=List[ReviewOut])
def get_my_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves all reviews written by the currently logged-in user.
    """
    reviews = db.query(Review).filter(
        Review.user_id == current_user.id
    ).order_by(Review.created_at.desc()).all()

    return [
        ReviewOut(
            id=r.id,
            user_id=r.user_id,
            book_id=r.book_id,
            book_title=r.book_title,
            book_cover=r.book_cover,
            rating=r.rating,
            review_text=r.review_text,
            created_at=r.created_at,
            author_name=current_user.user_id,
            author_gmail=current_user.gmail
        )
        for r in reviews
    ]


@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a review created by current user."""
    rev = db.query(Review).filter(Review.id == review_id, Review.user_id == current_user.id).first()
    if not rev:
        raise HTTPException(status_code=404, detail="Review not found or unauthorized")
    db.delete(rev)
    db.commit()
    return None

