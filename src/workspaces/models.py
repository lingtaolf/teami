from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(frozen=True, slots=True)
class Workspace:
    uuid: UUID
    name: str
    description: str | None
    create_time: datetime
