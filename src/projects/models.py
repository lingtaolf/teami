from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(frozen=True, slots=True)
class Project:
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
