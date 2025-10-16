from __future__ import annotations

from typing import Any

from pydantic import BaseModel

DEFAULT_SUCCESS_CODE = 2000
DEFAULT_SUCCESS_MESSAGE = "success"
DEFAULT_ERROR_CODE = 5000
DEFAULT_ERROR_MESSAGE = "error"


class APIResponse(BaseModel):
    code: int
    msg: str
    data: Any

    @classmethod
    def success(cls, data: Any, msg: str = DEFAULT_SUCCESS_MESSAGE, code: int = DEFAULT_SUCCESS_CODE) -> "APIResponse":
        return cls(code=code, msg=msg, data=data)

    @classmethod
    def failure(
        cls,
        msg: str = DEFAULT_ERROR_MESSAGE,
        *,
        code: int = DEFAULT_ERROR_CODE,
        data: Any = None,
    ) -> "APIResponse":
        return cls(code=code, msg=msg, data=data if data is not None else {})
