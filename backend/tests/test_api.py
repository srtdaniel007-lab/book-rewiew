import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.models import User, ShelvedBook, Review
from app.database import SessionLocal

client = TestClient(app)

def run_tests():
    print("--- 1. Testing Registration Validation ---")
    
    # 1. Non-gmail should fail
    bad_email = client.post("/api/auth/register", json={
        "user_id": "test_reader_1",
        "gmail": "reader@yahoo.com",
        "password": "strongpassword123"
    })
    print("Non-gmail status:", bad_email.status_code, "(Expected 422)")
    assert bad_email.status_code == 422, "Failed to reject non-gmail"

    # 2. Short password (< 8 chars) should fail
    short_pass = client.post("/api/auth/register", json={
        "user_id": "test_reader_2",
        "gmail": "reader2@gmail.com",
        "password": "short"
    })
    print("Short password status:", short_pass.status_code, "(Expected 422)")
    assert short_pass.status_code == 422, "Failed to reject short password"

    # 3. Clean any previous test user
    db = SessionLocal()
    existing = db.query(User).filter(User.gmail == "daniel.reader@gmail.com").first()
    if existing:
        db.delete(existing)
        db.commit()
    db.close()

    # 4. Valid Registration
    reg_resp = client.post("/api/auth/register", json={
        "user_id": "daniel_books",
        "gmail": "daniel.reader@gmail.com",
        "password": "Password123!"
    })
    print("Valid registration status:", reg_resp.status_code, "(Expected 201)")
    assert reg_resp.status_code == 201, reg_resp.text
    reg_data = reg_resp.json()
    token = reg_data["access_token"]
    print("Access token generated:", token[:25] + "...")

    # 5. Duplicate Gmail registration should fail
    dup_resp = client.post("/api/auth/register", json={
        "user_id": "daniel_another_id",
        "gmail": "daniel.reader@gmail.com",
        "password": "Password123!"
    })
    print("Duplicate gmail status:", dup_resp.status_code, "(Expected 400)")
    assert dup_resp.status_code == 400, "Failed to block duplicate gmail"
    print("Duplicate gmail message:", dup_resp.json()["detail"])

    # 6. Verify password is hashed in database
    db = SessionLocal()
    db_user = db.query(User).filter(User.gmail == "daniel.reader@gmail.com").first()
    assert db_user is not None
    assert db_user.password_hash.startswith("$2b$"), "Password is not bcrypt hashed!"
    print("PostgreSQL User ID:", db_user.id, "Bcrypt hash:", db_user.password_hash[:20] + "...")
    db.close()

    # 7. Login
    login_resp = client.post("/api/auth/login", json={
        "gmail_or_user_id": "daniel.reader@gmail.com",
        "password": "Password123!"
    })
    assert login_resp.status_code == 200, "Login failed"
    print("Login successful for:", login_resp.json()["user"]["user_id"])

    # 8. Shelving a book
    headers = {"Authorization": f"Bearer {token}"}
    shelf_resp = client.post("/api/shelves", json={
        "book_id": "clean_code_101",
        "title": "Clean Code",
        "authors": "Robert C. Martin",
        "cover_image": "https://covers.openlibrary.org/b/id/123-M.jpg",
        "description": "A handbook of agile software craftsmanship",
        "status": "want_to_read"
    }, headers=headers)
    assert shelf_resp.status_code == 200, shelf_resp.text
    print("Book shelved successfully:", shelf_resp.json()["status"])

    # 9. Creating a review
    rev_resp = client.post("/api/reviews", json={
        "book_id": "clean_code_101",
        "book_title": "Clean Code",
        "book_cover": "https://covers.openlibrary.org/b/id/123-M.jpg",
        "rating": 5,
        "review_text": "One of the best programming books ever written. Essential for every developer!"
    }, headers=headers)
    assert rev_resp.status_code == 201, rev_resp.text
    print("Review published:", rev_resp.json()["review_text"])

    # 10. PostgreSQL Database Inspector
    db_tables_resp = client.get("/api/database/tables")
    assert db_tables_resp.status_code == 200
    tables = db_tables_resp.json()["tables"]
    print("PostgreSQL Tables verified in API:")
    print(" - users count:", tables["users"]["count"])
    print(" - shelved_books count:", tables["shelved_books"]["count"])
    print(" - reviews count:", tables["reviews"]["count"])

    print("\nALL BACKEND TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    run_tests()
