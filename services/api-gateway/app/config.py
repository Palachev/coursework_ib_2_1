from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    auth_service_url: str = "http://auth-service:8000"
    task_service_url: str = "http://task-service:8000"
    notification_service_url: str = "http://notification-service:8000"

    jwt_secret_key: str = ""
    jwt_algorithm: str = "HS256"

    request_timeout_seconds: float = 10.0

    model_config = SettingsConfigDict(env_prefix="GATEWAY_", env_file=".env", extra="ignore")


settings = Settings()
