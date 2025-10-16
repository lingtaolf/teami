from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID, uuid4

from src.db import Database
from src.exceptions import APIError
from src.schemas.projects import ProjectCreate, ProjectUpdate
from src.workspaces.repository import get_by_uuid as get_workspace_by_uuid
from src.workspaces.service import WorkspaceNotFoundError

from .models import Project
from .repository import (
    count_by_workspace,
    delete as repo_delete,
    ensure_table,
    get_by_uuid,
    get_by_workspace_and_name,
    insert,
    list_by_workspace,
    update,
)


class ProjectNameConflictError(APIError):
    """Raised when a project name already exists in a workspace."""

    def __init__(self, name: str) -> None:
        super().__init__(code=3101, msg=f"Project name '{name}' already exists", http_status=409)
        self.name = name


class ProjectNotFoundError(APIError):
    """Raised when a project cannot be located."""

    def __init__(self, project_uuid: UUID) -> None:
        super().__init__(
            code=3104,
            msg=f"Project '{project_uuid}' was not found",
            http_status=404,
        )
        self.project_uuid = project_uuid


def initialize_storage(database: Database) -> None:
    """Ensure project tables exist."""
    with database.session() as connection:
        ensure_table(connection)


def _ensure_workspace_exists(connection, workspace_uuid: UUID) -> None:
    workspace = get_workspace_by_uuid(connection, workspace_uuid)
    if workspace is None:
        raise WorkspaceNotFoundError(workspace_uuid)


def create_project(database: Database, payload: ProjectCreate) -> Project:
    """Create a new project in a workspace."""
    now = datetime.now(timezone.utc)
    with database.session() as connection:
        _ensure_workspace_exists(connection, payload.workspace_uuid)
        if get_by_workspace_and_name(connection, payload.workspace_uuid, payload.name):
            raise ProjectNameConflictError(payload.name)
        project = Project(
            uuid=uuid4(),
            workspace_uuid=payload.workspace_uuid,
            name=payload.name,
            description=payload.description,
            labels=payload.labels or [],
            status_uuid=payload.status_uuid,
            progress_uuid=payload.progress_uuid,
            ai_team_uuid=payload.ai_team_uuid,
            create_time=now,
            last_open_time=payload.last_open_time or now,
        )
        insert(connection, project)
    return project


def fetch_project(database: Database, project_uuid: UUID) -> Project:
    """Return project by uuid or raise."""
    with database.session() as connection:
        project = get_by_uuid(connection, project_uuid)
    if project is None:
        raise ProjectNotFoundError(project_uuid)
    return project


def list_projects(database: Database, workspace_uuid: UUID, *, page: int, page_size: int) -> tuple[list[Project], int]:
    """List projects under a workspace."""
    offset = (page - 1) * page_size
    with database.session() as connection:
        _ensure_workspace_exists(connection, workspace_uuid)
        total = count_by_workspace(connection, workspace_uuid)
        items = list_by_workspace(connection, workspace_uuid, offset=offset, limit=page_size)
    return items, total


def update_project(database: Database, project_uuid: UUID, payload: ProjectUpdate) -> Project:
    """Update an existing project."""
    with database.session() as connection:
        project = get_by_uuid(connection, project_uuid)
        if project is None:
            raise ProjectNotFoundError(project_uuid)

        new_workspace_uuid = payload.workspace_uuid or project.workspace_uuid
        _ensure_workspace_exists(connection, new_workspace_uuid)

        new_name = payload.name or project.name
        existing = get_by_workspace_and_name(connection, new_workspace_uuid, new_name)
        if existing and existing.uuid != project.uuid:
            raise ProjectNameConflictError(new_name)

        updated_project = Project(
            uuid=project.uuid,
            workspace_uuid=new_workspace_uuid,
            name=new_name,
            description=payload.description if payload.description is not None else project.description,
            labels=payload.labels if payload.labels is not None else project.labels,
            status_uuid=payload.status_uuid if payload.status_uuid is not None else project.status_uuid,
            progress_uuid=payload.progress_uuid if payload.progress_uuid is not None else project.progress_uuid,
            ai_team_uuid=payload.ai_team_uuid if payload.ai_team_uuid is not None else project.ai_team_uuid,
            create_time=project.create_time,
            last_open_time=payload.last_open_time if payload.last_open_time is not None else project.last_open_time,
        )
        update(connection, updated_project)
    return updated_project


def delete_project(database: Database, project_uuid: UUID) -> None:
    """Delete project by uuid."""
    with database.session() as connection:
        removed = repo_delete(connection, project_uuid)
        if not removed:
            raise ProjectNotFoundError(project_uuid)
