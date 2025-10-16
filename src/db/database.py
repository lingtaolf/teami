from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from sqlite3 import Connection
from typing import Iterator


class Database:
    """Simple SQLite database helper."""

    def __init__(self, path: Path) -> None:
        self._path = Path(path)
        if self._path.parent:
            self._path.parent.mkdir(parents=True, exist_ok=True)

    @property
    def path(self) -> Path:
        return self._path

    def connect(self) -> Connection:
        connection = sqlite3.connect(self._path)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        return connection

    @contextmanager
    def session(self) -> Iterator[Connection]:
        connection = self.connect()
        try:
            yield connection
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()
