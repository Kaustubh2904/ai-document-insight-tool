from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: str
    jwt_secret_key: str
    openai_api_key: str
    frontend_url: str = "http://localhost:5500"
    debug: bool = False
    
    class Config:
        env_file = ".env"

settings = Settings()
