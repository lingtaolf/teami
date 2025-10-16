from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class WorkspaceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=1024)


class WorkspaceRead(BaseModel):
    uuid: UUID
    name: str
    description: str | None
    create_time: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkspacePage(BaseModel):
    items: list[WorkspaceRead]
    total: int
    page: int
    page_size: int
