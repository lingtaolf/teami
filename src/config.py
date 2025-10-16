from __future__ import annotations

import os
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv


PROJECT_ROOT = Path(__file__).resolve().parent.parent


def _load_dotenv() -> None:
    """Load root .env file with override priority."""
    env_file = PROJECT_ROOT / ".env"
    if env_file.exists():
        load_dotenv(dotenv_path=env_file, override=True)


_load_dotenv()


def _bool_env(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


def _list_env(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    """Application configuration sourced from .env or environment variables."""

    app_name: str = os.getenv("APP_NAME", "AI Team Collaboration Platform API")
    debug: bool = _bool_env(os.getenv("DEBUG"), default=False)
    port: int = int(os.getenv("PORT", "8000"))
    database_path: Path = Path(
        os.getenv("DATABASE_PATH", PROJECT_ROOT / ".sqlite" / "app.db")
    )
    cors_origins: list[str] = field(
        default_factory=lambda: _list_env(os.getenv("CORS_ORIGINS"))
        or ["http://localhost:5173", "http://127.0.0.1:5173"]
    )


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()
