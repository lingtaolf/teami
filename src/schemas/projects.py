from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProjectBase(BaseModel):
    workspace_uuid: UUID | None = Field(None)
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, max_length=2048)
    labels: list[str] | None = None
    status_uuid: UUID | None = None
    progress_uuid: UUID | None = None
    ai_team_uuid: UUID | None = None
    last_open_time: datetime | None = None


class ProjectCreate(ProjectBase):
    workspace_uuid: UUID = Field(..., description="Workspace identifier to attach project")
    name: str = Field(..., min_length=1, max_length=255)
    labels: list[str] | None = Field(default=None)
    last_open_time: datetime | None = None


class ProjectUpdate(ProjectBase):
    model_config = ConfigDict(extra="forbid")


class ProjectRead(BaseModel):
    uuid: UUID
    workspace_uuid: UUID
    name: str
    description: str | None
    labels: list[str]
    status_uuid: UUID | None
    progress_uuid: UUID | None
    ai_team_uuid: UUID | None
    create_time: datetime
    last_open_time: datetime | None

    model_config = ConfigDict(from_attributes=True)


class ProjectPage(BaseModel):
    projects: list[ProjectRead]
    total: int
    page: int
    page_size: int
