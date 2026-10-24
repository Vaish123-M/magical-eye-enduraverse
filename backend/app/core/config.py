"""
Application Settings — loaded from environment variables / .env file.
All secrets MUST be provided via environment; defaults here are for local dev only.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from pydantic import Field, model_validator


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────────────────────────
    APP_NAME: str = "MagicalEye — Defect Detection API"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    API_PREFIX: str = "/api/v1"
    LOG_LEVEL: str = "INFO"
    OTEL_EXPORTER_OTLP_ENDPOINT: str = ""
    JAEGER_AGENT_HOST: str = ""

    # Frontend origins allowed to call API
    CORS_ORIGINS: list[str] = Field(default_factory=lambda: ["http://localhost:5173", "http://localhost:3000"])

    # ── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./magical_eye.db"   # swap to postgres in prod
    DB_ECHO: bool = False

    # ── Security ─────────────────────────────────────────────────────────────
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DEFAULT_ADMIN_USERNAME: str = "admin"
    DEFAULT_ADMIN_PASSWORD: str = "admin123"
    DEVICE_API_KEY: str = "demo-device-key"

    # ── Storage ──────────────────────────────────────────────────────────────
    STORAGE_BACKEND: str = "local"           # "local" | "s3"
    LOCAL_STORAGE_PATH: str = "storage/images"
    AWS_BUCKET: str = ""
    AWS_REGION: str = ""
    AWS_ACCESS_KEY: str = ""
    AWS_SECRET_KEY: str = ""

    # ── AI Model ─────────────────────────────────────────────────────────────
    MODEL_PATH: str = "../model/exports/defect_model.onnx"
    MODEL_INPUT_SIZE: int = 224
    CONFIDENCE_THRESHOLD: float = 0.5

    # ── Cache ────────────────────────────────────────────────────────────────
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    CACHE_ENABLED: bool = True
    CACHE_TTL: int = 300  # 5 minutes default

    # ── Cloud Sync ───────────────────────────────────────────────────────────
    CLOUD_SYNC_ENABLED: bool = False
    CLOUD_SYNC_ENDPOINT: str = ""

    # ── Alerts ───────────────────────────────────────────────────────────────
    ALERT_EMAIL_ENABLED: bool = False
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    ALERT_RECIPIENTS: list[str] = Field(default_factory=list)
    ALLOW_FALLBACK_INFERENCE: bool = True

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        if self.ENVIRONMENT.lower() == "production":
            unsafe = {
                "SECRET_KEY": self.SECRET_KEY == "CHANGE_ME_IN_PRODUCTION",
                "DEFAULT_ADMIN_PASSWORD": self.DEFAULT_ADMIN_PASSWORD == "admin123",
                "DEVICE_API_KEY": self.DEVICE_API_KEY == "demo-device-key",
            }
            missing = [name for name, is_unsafe in unsafe.items() if is_unsafe]
            if missing:
                raise ValueError(
                    "Unsafe production defaults detected; configure: " + ", ".join(missing)
                )
            if self.ALLOW_FALLBACK_INFERENCE:
                raise ValueError("ALLOW_FALLBACK_INFERENCE must be false in production")
        return self

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
