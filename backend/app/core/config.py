"""
BiteBase Intelligence Configuration
Environment-based configuration management
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "BiteBase Intelligence"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # API
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # Database - PostgreSQL with PostGIS (production) / SQLite (development)
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "bitebase"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "bitebase_intelligence"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str = "sqlite+aiosqlite:///./bitebase_intelligence.db"
    
    # MongoDB for document storage
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB: str = "bitebase_intelligence"
    
    # Redis for caching
    REDIS_URL: str = "redis://localhost:6379"
    
    # External APIs
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GOOGLE_MAPS_API_KEY: Optional[str] = None
    
    # Geospatial
    DEFAULT_SRID: int = 4326  # WGS84
    
    # ML Models
    MODEL_CACHE_DIR: str = "./models"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()