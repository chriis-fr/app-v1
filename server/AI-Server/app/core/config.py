from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "AI Chatbot Service"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5000"
    ]
    
    # Security
    JWT_SECRET: str = "your-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Groq Configuration
    GROQ_API_KEY: str = ""
    
    # Database (if needed for context)
    DATABASE_URL: str = ""
    
    # AI Model Configuration
    MODEL_NAME: str = "llama3-8b-8192"
    MAX_TOKENS: int = 4096
    TEMPERATURE: float = 0.7
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# Update CORS origins from environment if provided
if os.getenv("CORS_ORIGINS"):
    settings.CORS_ORIGINS = os.getenv("CORS_ORIGINS", "").split(",") 