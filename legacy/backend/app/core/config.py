"""
BiteBase Intelligence Configuration
Environment-based configuration management with reliability features
"""

from pydantic_settings import BaseSettings
from typing import List, Optional, Dict, Any
import os
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings with reliability and monitoring configuration"""
    
    # Application
    APP_NAME: str = "BiteBase Intelligence"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"  # development, staging, production
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 1
    RELOAD: bool = False
    
    # CORS Configuration
    ALLOWED_HOSTS: List[str] = ["*"]
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5000", "http://localhost:50513"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]
    
    # Database Configuration
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "bitebase"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "bitebase_intelligence"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str = "sqlite+aiosqlite:///./bitebase_intelligence.db"
    
    # Database Pool Configuration
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    DATABASE_POOL_TIMEOUT: int = 30
    DATABASE_POOL_RECYCLE: int = 3600
    
    # Redis Configuration for Caching
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_PASSWORD: Optional[str] = None
    REDIS_DB: int = 0
    REDIS_MAX_CONNECTIONS: int = 100
    REDIS_TIMEOUT: int = 5
    
    # Cache Configuration
    CACHE_TTL_DEFAULT: int = 300  # 5 minutes
    CACHE_TTL_LONG: int = 3600   # 1 hour
    CACHE_TTL_SHORT: int = 60    # 1 minute
    ENABLE_CACHING: bool = True
    
    # External API Configuration
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GOOGLE_GENAI_API_KEY: Optional[str] = None
    GOOGLE_MAPS_API_KEY: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    
    # External API Timeouts and Retries
    EXTERNAL_API_TIMEOUT: int = 30
    EXTERNAL_API_RETRIES: int = 3
    EXTERNAL_API_BACKOFF_FACTOR: float = 2.0
    
    # Rate Limiting Configuration
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_DEFAULT: str = "1000/hour"
    RATE_LIMIT_AUTH: str = "5000/hour"
    RATE_LIMIT_AI: str = "100/hour"
    RATE_LIMIT_ADMIN: str = "10000/hour"
    
    # Security Configuration
    JWT_SECRET_KEY: str = "your-jwt-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    JWT_REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    PASSWORD_MIN_LENGTH: int = 8
    PASSWORD_REQUIRE_SPECIAL_CHARS: bool = True
    
    # Session Configuration
    SESSION_SECRET_KEY: str = "your-session-secret-change-in-production"
    SESSION_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Logging Configuration
    LOG_LEVEL: str = "INFO"
    LOG_FILE: Optional[str] = None
    LOG_MAX_SIZE: int = 10 * 1024 * 1024  # 10MB
    LOG_BACKUP_COUNT: int = 5
    ENABLE_STRUCTURED_LOGGING: bool = True
    ENABLE_REQUEST_LOGGING: bool = True
    
    # Monitoring Configuration
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = 8001
    HEALTH_CHECK_INTERVAL: int = 60  # seconds
    
    # Performance Configuration
    MAX_REQUEST_SIZE: int = 50 * 1024 * 1024  # 50MB
    REQUEST_TIMEOUT: int = 300  # 5 minutes
    WORKER_TIMEOUT: int = 600   # 10 minutes
    KEEP_ALIVE_TIMEOUT: int = 5
    
    # Feature Flags
    ENABLE_AI_FEATURES: bool = True
    ENABLE_GEOSPATIAL: bool = True
    ENABLE_REAL_TIME: bool = True
    ENABLE_ANALYTICS: bool = True
    ENABLE_ADMIN_PANEL: bool = True
    
    # Business Logic Configuration
    DEFAULT_PAGINATION_SIZE: int = 20
    MAX_PAGINATION_SIZE: int = 100
    DEFAULT_SEARCH_RADIUS: int = 5000  # meters
    MAX_SEARCH_RADIUS: int = 50000     # meters
    
    # File Upload Configuration
    UPLOAD_MAX_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_ALLOWED_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    UPLOAD_DIR: str = "./uploads"
    
    # Email Configuration
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_USE_TLS: bool = True
    EMAIL_FROM: Optional[str] = None
    
    # Backup Configuration
    BACKUP_ENABLED: bool = False
    BACKUP_INTERVAL_HOURS: int = 24
    BACKUP_RETENTION_DAYS: int = 30
    BACKUP_STORAGE_PATH: str = "./backups"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment"""
        return self.ENVIRONMENT.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment"""
        return self.ENVIRONMENT.lower() == "development"
    
    @property
    def is_testing(self) -> bool:
        """Check if running in testing environment"""
        return self.ENVIRONMENT.lower() == "testing"
    
    def get_database_url(self) -> str:
        """Get appropriate database URL based on environment"""
        if self.DATABASE_URL.startswith("postgresql"):
            return self.DATABASE_URL
        elif self.DATABASE_URL.startswith("sqlite"):
            return self.DATABASE_URL
        else:
            # Construct PostgreSQL URL from components
            return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    def get_redis_url(self) -> str:
        """Get Redis URL with optional password"""
        if self.REDIS_PASSWORD:
            base_url = self.REDIS_URL.replace("redis://", f"redis://:{self.REDIS_PASSWORD}@")
            return f"{base_url}/{self.REDIS_DB}"
        return f"{self.REDIS_URL}/{self.REDIS_DB}"
    
    def get_cors_settings(self) -> Dict[str, Any]:
        """Get CORS configuration as dictionary"""
        return {
            "allow_origins": self.CORS_ORIGINS,
            "allow_credentials": self.CORS_ALLOW_CREDENTIALS,
            "allow_methods": self.CORS_ALLOW_METHODS,
            "allow_headers": self.CORS_ALLOW_HEADERS,
        }
    
    def validate_required_secrets(self) -> List[str]:
        """Validate that required secrets are configured"""
        missing_secrets = []
        
        if self.is_production:
            # Check critical production secrets
            if self.SECRET_KEY == "your-secret-key-change-in-production":
                missing_secrets.append("SECRET_KEY")
            
            if self.JWT_SECRET_KEY == "your-jwt-secret-change-in-production":
                missing_secrets.append("JWT_SECRET_KEY")
            
            if not self.ANTHROPIC_API_KEY:
                missing_secrets.append("ANTHROPIC_API_KEY")
        
        return missing_secrets
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Global settings instance
settings = get_settings()
