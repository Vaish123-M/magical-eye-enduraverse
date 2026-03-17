"""
Application Settings — loaded from environment variables / .env file.
All secrets MUST be provided via environment; defaults here are for local dev only.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from pydantic import Field


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────────────────────────
    APP_NAME: str = "MagicalEye — Defect Detection API"
    DEBUG: bool = False
    API_PREFIX: str = "/api/v1"
    LOG_LEVEL: str = "INFO"

    # Frontend origins allowed to call API
    CORS_ORIGINS: list[str] = Field(default_factory=lambda: ["http://localhost:5173", "http://localhost:3000"])

    # ── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./magical_eye.db"   # swap to postgres in prod
    DB_ECHO: bool = False

    # ── Security ─────────────────────────────────────────────────────────────
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DEFAULT_ADMIN_USERNAME: str = "admin"
    DEFAULT_ADMIN_PASSWORD: str = "changeme"
    DEVICE_API_KEY: str = "demo-device-key"

    # ── Storage ──────────────────────────────────────────────────────────────
    STORAGE_BACKEND: str = "local"           # "local" | "s3"
    LOCAL_STORAGE_PATH: str = "storage/images"
    AWS_BUCKET: str = ""
    AWS_REGION: str = ""
    AWS_ACCESS_KEY: str = ""
    AWS_SECRET_KEY: str = ""

    # ── AI Model ─────────────────────────────────────────────────────────────
    MODEL_PATH: str = "model/exports/defect_model.onnx"
    MODEL_INPUT_SIZE: int = 224
    CONFIDENCE_THRESHOLD: float = 0.5

    # ── Cloud Sync ───────────────────────────────────────────────────────────
    CLOUD_SYNC_ENABLED: bool = False
    CLOUD_SYNC_ENDPOINT: str = ""

    # ── Alerts ───────────────────────────────────────────────────────────────
    ALERT_EMAIL_ENABLED: bool = False
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    ALERT_RECIPIENTS: list[str] = []

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
