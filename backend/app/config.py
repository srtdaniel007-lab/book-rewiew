import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

# Automatically locate and load .env file from backend or root directory
env_paths = [
    Path(".env"),
    Path(__file__).resolve().parent.parent / ".env",
    Path(__file__).resolve().parent.parent.parent / ".env",
]
for p in env_paths:
    if p.exists():
        load_dotenv(p)
        break

class Settings(BaseModel):
    # Server Host & Port
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8001"))

    # Security & Secret Key
    JWT_SECRET: str = os.getenv("JWT_SECRET", "goodreads-super-secret-jwt-key-2026")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 48

    # Cross-Origin Resource Sharing (CORS)
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")

    # PostgreSQL Database credentials
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "root")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "5432")
    DB_NAME: str = os.getenv("DB_NAME", "book_review")

    @property
    def cors_origins_list(self) -> list[str]:
        if not self.CORS_ORIGINS or self.CORS_ORIGINS.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def DATABASE_URL(self) -> str:
        env_url = os.getenv("DATABASE_URL")
        if env_url:
            # Render/Heroku provide postgres:// but SQLAlchemy requires postgresql+psycopg2://
            if env_url.startswith("postgres://"):
                env_url = env_url.replace("postgres://", "postgresql+psycopg2://", 1)
            elif env_url.startswith("postgresql://") and not env_url.startswith("postgresql+"):
                env_url = env_url.replace("postgresql://", "postgresql+psycopg2://", 1)
            return env_url
        return f"postgresql+psycopg2://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

settings = Settings()
