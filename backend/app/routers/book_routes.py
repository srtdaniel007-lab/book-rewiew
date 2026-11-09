from typing import List, Optional
import httpx
from fastapi import APIRouter, HTTPException, Query
from app.schemas import BookItem

router = APIRouter(prefix="/api/books", tags=["Books (Open Source API)"])

GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes"
OPEN_LIBRARY_API = "https://openlibrary.org/search.json"

def clean_cover_url(url: Optional[str]) -> str:
    if not url:
        return ""
    # Ensure HTTPS for images
    if url.startswith("http://"):
        url = "https://" + url[7:]
    # High resolution tweak for Google Books
    return url

@router.get("/search", response_model=List[BookItem])
async def search_books(
    q: str = Query("fiction bestseller", min_length=1, description="Search query or keyword"),
    max_results: int = Query(24, ge=1, le=40)
):
    """
    Searches books using Google Books API with Open Library fallback.
    Returns clean, structured book information with title, authors,
    cover image, short summary/description, and rating metrics.
    """
    clean_query = q.strip()
    if not clean_query:
        clean_query = "bestseller books"

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                GOOGLE_BOOKS_API,
                params={
                    "q": clean_query,
                    "maxResults": max_results,
                    "printType": "books",
                    "orderBy": "relevance"
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                items = data.get("items", [])
                books: List[BookItem] = []
                for item in items:
                    info = item.get("volumeInfo", {})
                    image_links = info.get("imageLinks", {})
                    cover = image_links.get("thumbnail") or image_links.get("smallThumbnail") or ""
                    
                    # Clean description
                    desc = info.get("description", "")
                    if desc and len(desc) > 300:
                        short_desc = desc[:297] + "..."
                    else:
                        short_desc = desc

                    published_date = info.get("publishedDate", "")
                    year = published_date.split("-")[0] if published_date else ""

                    books.append(
                        BookItem(
                            id=item.get("id"),
                            title=info.get("title", "Untitled"),
                            authors=info.get("authors", ["Unknown Author"]),
                            description=short_desc,
                            cover_image=clean_cover_url(cover),
                            published_year=year,
                            page_count=info.get("pageCount"),
                            average_rating=info.get("averageRating"),
                            ratings_count=info.get("ratingsCount"),
                            categories=info.get("categories", [])
                        )
                    )
                return books
    except Exception as e:
        # Fallback to Open Library
        pass

    # Open Library fallback
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                OPEN_LIBRARY_API,
                params={"q": clean_query, "limit": max_results}
            )
            if resp.status_code == 200:
                data = resp.json()
                docs = data.get("docs", [])
                books = []
                for doc in docs:
                    cover_i = doc.get("cover_i")
                    cover = f"https://covers.openlibrary.org/b/id/{cover_i}-M.jpg" if cover_i else ""
                    key = doc.get("key", "").replace("/works/", "")
                    books.append(
                        BookItem(
                            id=key or doc.get("title", "unknown"),
                            title=doc.get("title", "Untitled"),
                            authors=doc.get("author_name", ["Unknown"]),
                            description=f"First published in {doc.get('first_publish_year', 'N/A')}",
                            cover_image=cover,
                            published_year=str(doc.get("first_publish_year", "")),
                            ratings_count=doc.get("ratings_count", None),
                            categories=doc.get("subject", [])[:3]
                        )
                    )
                return books
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch books from open source APIs: {str(e)}")

    return []


@router.get("/{book_id}", response_model=BookItem)
async def get_book_details(book_id: str):
    """
    Fetches comprehensive details for a specific book by ID.
    """
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(f"{GOOGLE_BOOKS_API}/{book_id}")
            if resp.status_code == 200:
                item = resp.json()
                info = item.get("volumeInfo", {})
                image_links = info.get("imageLinks", {})
                cover = (
                    image_links.get("medium") or 
                    image_links.get("thumbnail") or 
                    image_links.get("smallThumbnail") or 
                    ""
                )
                published_date = info.get("publishedDate", "")
                year = published_date.split("-")[0] if published_date else ""

                return BookItem(
                    id=item.get("id"),
                    title=info.get("title", "Untitled"),
                    authors=info.get("authors", ["Unknown Author"]),
                    description=info.get("description", "No description available."),
                    cover_image=clean_cover_url(cover),
                    published_year=year,
                    page_count=info.get("pageCount"),
                    average_rating=info.get("averageRating"),
                    ratings_count=info.get("ratingsCount"),
                    categories=info.get("categories", [])
                )
    except Exception:
        pass

    raise HTTPException(status_code=404, detail="Book details not found on open API.")

