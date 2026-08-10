import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Finance Management System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Environment Variables
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip().strip('"').strip("'")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "").strip().strip('"').strip("'")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "").strip().strip('"').strip("'")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "").strip().strip('"').strip("'")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_secret_jwt_key_change_in_production_ai_finance_2026").strip().strip('"').strip("'")
    REFRESH_SECRET_KEY: str = os.getenv("REFRESH_SECRET_KEY", "super_secret_refresh_jwt_key_ai_finance_2026").strip().strip('"').strip("'")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30 # 30 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./finance.db")
    
    # Uploads
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
    
    class Config:
        case_sensitive = True

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
