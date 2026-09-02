"""Application configuration via environment variables."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Always load backend/.env regardless of cwd when starting uvicorn
_BACKEND_ROOT = Path(__file__).resolve().parents[2]
_ENV_FILE = _BACKEND_ROOT / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE) if _ENV_FILE.exists() else ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # LLM
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    groq_router_model: str = "llama-3.1-8b-instant"
    groq_vision_model: str = "meta-llama/llama-4-scout-17b-16e-instruct"

    # Database
    database_url: str = (
        "postgresql+asyncpg://intellecta:intellecta@localhost:5432/intellecta_v2"
    )

    # Redis — use either TCP (REDIS_URL) or Upstash REST (both vars below)
    redis_url: str = "redis://localhost:6379/0"
    upstash_redis_rest_url: str = ""
    upstash_redis_rest_token: str = ""
    session_ttl_seconds: int = 86_400

    @property
    def uses_upstash_rest(self) -> bool:
        return bool(self.upstash_redis_rest_url and self.upstash_redis_rest_token)

    # Mem0
    mem0_api_key: str = ""
    mem0_user_id_prefix: str = "intellecta"

    # Auth
    jwt_secret_key: str = "dev-secret-change-in-production"
    jwt_expire_days: int = 7

    # Google OAuth 2 (GIS id_token flow)
    google_client_id: str = ""
    google_client_secret: str = ""
    frontend_url: str = "http://localhost:3000"

    # App
    app_env: str = "development"
    log_level: str = "INFO"
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


def reload_settings() -> Settings:
    """Clear settings cache after .env changes (dev convenience)."""
    get_settings.cache_clear()
    return get_settings()
