from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID, uuid4

from src.db import Database
from src.exceptions import APIError
from src.schemas.workspaces import WorkspaceCreate

from .models import Workspace
from .repository import (
    count_workspaces,
    delete as repo_delete,
    ensure_table,
    get_by_name,
    get_by_uuid,
    insert,
    list_workspaces as repo_list_workspaces,
)


class WorkspaceNameConflictError(APIError):
    """Raised when attempting to create a workspace with a duplicate name."""

    def __init__(self, name: str) -> None:
        super().__init__(
            code=3001,
            msg=f"Workspace name '{name}' already exists",
            http_status=409,
        )
        self.name = name


class WorkspaceNotFoundError(APIError):
    """Raised when attempting to mutate a workspace that does not exist."""

    def __init__(self, workspace_id: UUID) -> None:
        super().__init__(
            code=3004,
            msg=f"Workspace '{workspace_id}' was not found",
            http_status=404,
        )
        self.workspace_id = workspace_id


def initialize_storage(database: Database) -> None:
    """Create required tables for workspace domain if missing."""
    with database.session() as connection:
        ensure_table(connection)


def create_workspace(database: Database, payload: WorkspaceCreate) -> Workspace:
    """Create and persist a new workspace."""
    with database.session() as connection:
        if get_by_name(connection, payload.name):
            raise WorkspaceNameConflictError(payload.name)
        workspace = Workspace(
            uuid=uuid4(),
            name=payload.name,
            description=payload.description,
            create_time=datetime.now(timezone.utc),
        )
        insert(connection, workspace)
    return workspace


def fetch_workspace(database: Database, workspace_id: UUID) -> Workspace:
    """Retrieve a workspace by identifier."""
    with database.session() as connection:
        workspace = get_by_uuid(connection, workspace_id)
    if workspace is None:
        raise WorkspaceNotFoundError(workspace_id)
    return workspace


def list_workspaces(database: Database, *, page: int, page_size: int) -> tuple[list[Workspace], int]:
    """Return paginated workspaces and total count."""
    offset = (page - 1) * page_size
    with database.session() as connection:
        total = count_workspaces(connection)
        items = repo_list_workspaces(connection, offset=offset, limit=page_size)
    return items, total


def delete_workspace(database: Database, workspace_id: UUID) -> None:
    """Delete a workspace or raise an error if missing."""
    with database.session() as connection:
        removed = repo_delete(connection, workspace_id)
        if not removed:
            raise WorkspaceNotFoundError(workspace_id)
