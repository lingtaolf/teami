from __future__ import annotations

from datetime import datetime
from sqlite3 import Connection
from typing import Any, Mapping
from uuid import UUID

from .models import Workspace


CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS workspaces (
    uuid TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    create_time TEXT NOT NULL
)
"""
CREATE_NAME_INDEX_SQL = """
CREATE UNIQUE INDEX IF NOT EXISTS idx_workspaces_name ON workspaces(name)
"""


def ensure_table(connection: Connection) -> None:
    """Ensure the workspaces table exists."""
    connection.execute(CREATE_TABLE_SQL)
    connection.execute(CREATE_NAME_INDEX_SQL)


def insert(connection: Connection, workspace: Workspace) -> None:
    """Persist a workspace record."""
    connection.execute(
        """
        INSERT INTO workspaces (uuid, name, description, create_time)
        VALUES (?, ?, ?, ?)
        """,
        (
            str(workspace.uuid),
            workspace.name,
            workspace.description,
            workspace.create_time.isoformat(),
        ),
    )


def get_by_uuid(connection: Connection, workspace_id: UUID) -> Workspace | None:
    """Return a workspace by identifier or None when missing."""
    row = connection.execute(
        """
        SELECT uuid, name, description, create_time
        FROM workspaces
        WHERE uuid = ?
        """,
        (str(workspace_id),),
    ).fetchone()
    if row is None:
        return None
    return _hydrate_workspace(row)


def get_by_name(connection: Connection, name: str) -> Workspace | None:
    """Return a workspace by name."""
    row = connection.execute(
        """
        SELECT uuid, name, description, create_time
        FROM workspaces
        WHERE name = ?
        """,
        (name,),
    ).fetchone()
    if row is None:
        return None
    return _hydrate_workspace(row)


def list_workspaces(connection: Connection, *, offset: int, limit: int) -> list[Workspace]:
    """Return paginated workspaces ordered by creation time descending."""
    rows = connection.execute(
        """
        SELECT uuid, name, description, create_time
        FROM workspaces
        ORDER BY datetime(create_time) DESC
        LIMIT ? OFFSET ?
        """,
        (limit, offset),
    ).fetchall()
    return [_hydrate_workspace(row) for row in rows]


def count_workspaces(connection: Connection) -> int:
    """Return the total number of workspaces."""
    result = connection.execute(
        """
        SELECT COUNT(*) AS total
        FROM workspaces
        """
    ).fetchone()
    return int(result["total"]) if result is not None else 0


def delete(connection: Connection, workspace_id: UUID) -> bool:
    """Delete workspace; return True if a row was removed."""
    cursor = connection.execute(
        """
        DELETE FROM workspaces
        WHERE uuid = ?
        """,
        (str(workspace_id),),
    )
    return cursor.rowcount > 0


def _hydrate_workspace(row: Mapping[str, Any]) -> Workspace:
    return Workspace(
        uuid=UUID(row["uuid"]),
        name=row["name"],
        description=row["description"],
        create_time=datetime.fromisoformat(row["create_time"]),
    )
