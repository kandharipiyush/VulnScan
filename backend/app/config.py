import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "VulnScan API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./vulnscan.db")
    
    # Security / Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "vulnscan-secret-key-super-secure-change-in-prod-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # AI Engine
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini_or_rule_engine")  # fallback to expert rules if key empty
    
    # Reports
    REPORTS_DIR: str = os.getenv("REPORTS_DIR", "./generated_reports")
    
    # Target validation
    ALLOW_LOCALHOST: bool = True
    MAX_REQUEST_TIMEOUT: int = 15

    class Config:
        env_file = ".env"

settings = Settings()

