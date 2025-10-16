from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv


def _load_dotenv() -> None:
    """Load root .env file with override priority."""
    project_root = Path(__file__).resolve().parent.parent
    env_file = project_root / ".env"
    if env_file.exists():
        load_dotenv(dotenv_path=env_file, override=True)


_load_dotenv()


def _bool_env(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    """Application configuration sourced from .env or environment variables."""

    app_name: str = os.getenv("APP_NAME", "AI Team Collaboration Platform API")
    debug: bool = _bool_env(os.getenv("DEBUG"), default=False)
    port: int = int(os.getenv("PORT", "8000"))


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()
