from __future__ import annotations

import json
from datetime import datetime
from sqlite3 import Connection
from uuid import UUID

from .models import Project


CREATE_PROJECTS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS projects (
    uuid TEXT PRIMARY KEY,
    workspace_uuid TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    labels TEXT,
    status_uuid TEXT,
    progress_uuid TEXT,
    ai_team_uuid TEXT,
    create_time TEXT NOT NULL,
    last_open_time TEXT,
    FOREIGN KEY (workspace_uuid) REFERENCES workspaces (uuid) ON DELETE CASCADE
)
"""

CREATE_UNIQUE_INDEX_SQL = """
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_workspace_name
ON projects (workspace_uuid, name)
"""

CREATE_WORKSPACE_INDEX_SQL = """
CREATE INDEX IF NOT EXISTS idx_projects_workspace
ON projects (workspace_uuid)
"""


def ensure_table(connection: Connection) -> None:
    """Ensure storage for projects exists."""
    connection.execute(CREATE_PROJECTS_TABLE_SQL)
    connection.execute(CREATE_UNIQUE_INDEX_SQL)
    connection.execute(CREATE_WORKSPACE_INDEX_SQL)


def insert(connection: Connection, project: Project) -> None:
    """Insert new project record."""
    connection.execute(
        """
        INSERT INTO projects (
            uuid,
            workspace_uuid,
            name,
            description,
            labels,
            status_uuid,
            progress_uuid,
            ai_team_uuid,
            create_time,
            last_open_time
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            str(project.uuid),
            str(project.workspace_uuid),
            project.name,
            project.description,
            json.dumps(project.labels),
            str(project.status_uuid) if project.status_uuid else None,
            str(project.progress_uuid) if project.progress_uuid else None,
            str(project.ai_team_uuid) if project.ai_team_uuid else None,
            project.create_time.isoformat(),
            project.last_open_time.isoformat() if project.last_open_time else None,
        ),
    )


def update(connection: Connection, project: Project) -> None:
    """Update existing project record."""
    connection.execute(
        """
        UPDATE projects
        SET
            workspace_uuid = ?,
            name = ?,
            description = ?,
            labels = ?,
            status_uuid = ?,
            progress_uuid = ?,
            ai_team_uuid = ?,
            create_time = ?,
            last_open_time = ?
        WHERE uuid = ?
        """,
        (
            str(project.workspace_uuid),
            project.name,
            project.description,
            json.dumps(project.labels),
            str(project.status_uuid) if project.status_uuid else None,
            str(project.progress_uuid) if project.progress_uuid else None,
            str(project.ai_team_uuid) if project.ai_team_uuid else None,
            project.create_time.isoformat(),
            project.last_open_time.isoformat() if project.last_open_time else None,
            str(project.uuid),
        ),
    )


def delete(connection: Connection, project_uuid: UUID) -> bool:
    """Delete project by identifier. Return True if deleted."""
    cursor = connection.execute(
        """
        DELETE FROM projects WHERE uuid = ?
        """,
        (str(project_uuid),),
    )
    return cursor.rowcount > 0


def get_by_uuid(connection: Connection, project_uuid: UUID) -> Project | None:
    """Return project by uuid."""
    row = connection.execute(
        """
        SELECT
            uuid,
            workspace_uuid,
            name,
            description,
            labels,
            status_uuid,
            progress_uuid,
            ai_team_uuid,
            create_time,
            last_open_time
        FROM projects
        WHERE uuid = ?
        """,
        (str(project_uuid),),
    ).fetchone()
    if row is None:
        return None
    return _hydrate_project(row)


def get_by_workspace_and_name(connection: Connection, workspace_uuid: UUID, name: str) -> Project | None:
    """Return project matching workspace uuid and name."""
    row = connection.execute(
        """
        SELECT
            uuid,
            workspace_uuid,
            name,
            description,
            labels,
            status_uuid,
            progress_uuid,
            ai_team_uuid,
            create_time,
            last_open_time
        FROM projects
        WHERE workspace_uuid = ? AND name = ?
        """,
        (str(workspace_uuid), name),
    ).fetchone()
    if row is None:
        return None
    return _hydrate_project(row)


def list_by_workspace(
    connection: Connection, workspace_uuid: UUID, *, offset: int, limit: int
) -> list[Project]:
    """List projects under workspace ordered by last_open_time desc then create_time."""
    rows = connection.execute(
        """
        SELECT
            uuid,
            workspace_uuid,
            name,
            description,
            labels,
            status_uuid,
            progress_uuid,
            ai_team_uuid,
            create_time,
            last_open_time
        FROM projects
        WHERE workspace_uuid = ?
        ORDER BY datetime(last_open_time) DESC, datetime(create_time) DESC
        LIMIT ? OFFSET ?
        """,
        (str(workspace_uuid), limit, offset),
    ).fetchall()
    return [_hydrate_project(row) for row in rows]


def count_by_workspace(connection: Connection, workspace_uuid: UUID) -> int:
    """Count projects in workspace."""
    row = connection.execute(
        """
        SELECT COUNT(*) AS total
        FROM projects
        WHERE workspace_uuid = ?
        """,
        (str(workspace_uuid),),
    ).fetchone()
    return int(row["total"]) if row is not None else 0


def _hydrate_project(row) -> Project:
    return Project(
        uuid=UUID(row["uuid"]),
        workspace_uuid=UUID(row["workspace_uuid"]),
        name=row["name"],
        description=row["description"],
        labels=json.loads(row["labels"]) if row["labels"] else [],
        status_uuid=UUID(row["status_uuid"]) if row["status_uuid"] else None,
        progress_uuid=UUID(row["progress_uuid"]) if row["progress_uuid"] else None,
        ai_team_uuid=UUID(row["ai_team_uuid"]) if row["ai_team_uuid"] else None,
        create_time=datetime.fromisoformat(row["create_time"]),
        last_open_time=datetime.fromisoformat(row["last_open_time"])
        if row["last_open_time"]
        else None,
    )
