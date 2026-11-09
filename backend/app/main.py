from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import auth_routes, book_routes, user_routes, admin_routes

# Create PostgreSQL tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Book Review API (Goodreads Clone)",
    description="Full-stack book review API with PostgreSQL, JWT Auth, and Free Open Book APIs",
    version="1.0.0"
)

# Configure CORS for React frontend (dynamically configured via .env CORS_ORIGINS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API Routers
app.include_router(auth_routes.router)
app.include_router(book_routes.router)
app.include_router(user_routes.router)
app.include_router(admin_routes.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to Book Review & Goodreads Clone API",
        "docs": "/docs",
        "database": "PostgreSQL (book_review)",
        "status": "healthy"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "database": "connected"}

