from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://postgres:postgres@task-db:5432/task_db"

    model_config = SettingsConfigDict(env_prefix="TASK_", env_file=".env", extra="ignore")


settings = Settings()
