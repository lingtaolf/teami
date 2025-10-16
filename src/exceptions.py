from __future__ import annotations

from typing import Any


class APIError(Exception):
    """Base application error carrying unified response metadata."""

    def __init__(
        self,
        *,
        code: int,
        msg: str,
        http_status: int,
        data: Any | None = None,
    ) -> None:
        self.code = code
        self.msg = msg
        self.http_status = http_status
        self.data = data if data is not None else {}
        super().__init__(msg)
