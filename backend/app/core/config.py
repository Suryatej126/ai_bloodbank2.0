import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv(override=True)

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Powered Digital Blood Bank"
    
    # JWT Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkeythatshouldbechangedinproduction")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database Settings
    # Expects format: postgresql://username:password@host:port/database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/bloodbank"
    )

    class Config:
        case_sensitive = True

settings = Settings()
