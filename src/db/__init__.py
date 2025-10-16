from __future__ import annotations

from functools import lru_cache

from src.config import get_settings

from .database import Database

__all__ = ["Database", "get_database"]


@lru_cache()
def get_database() -> Database:
    """Return shared database handle configured from settings."""
    settings = get_settings()
    return Database(settings.database_path)
