import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/poker_db")
    
    # API
    API_V1_STR = "/api/v1"
    PROJECT_NAME = "Poker Game API"
    
    # CORS
    BACKEND_CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]

settings = Settings()
