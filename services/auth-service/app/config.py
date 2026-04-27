from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://postgres:postgres@auth-db:5432/auth_db"
    jwt_secret_key: str = Field(..., min_length=16)
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    model_config = SettingsConfigDict(env_prefix="AUTH_", env_file=".env", extra="ignore")


settings = Settings()
