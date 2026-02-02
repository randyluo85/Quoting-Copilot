# backend/app/core/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "mysql+aiomysql://smartquote:smartpassword@localhost:3306/smartquote"
    vector_db_url: str = "postgresql+asyncpg://smartquote:smartpassword@localhost:5432/smartquote_vector"

    # API
    api_v1_prefix: str = "/api/v1"

    # CORS
    backend_cors_origins: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
