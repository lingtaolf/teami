import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from src.exceptions import APIError
from src.schemas.api_response import APIResponse

from .config import get_settings
from .db import get_database
from .workspaces import router as workspace_router
from .workspaces.service import initialize_storage as initialize_workspace_storage
from .projects import router as project_router
from .projects.service import initialize_storage as initialize_project_storage

logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(title=settings.app_name, debug=settings.debug)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(workspace_router)
app.include_router(project_router)


@app.get("/health", summary="Service health check")
def health() -> dict[str, str]:
    """Expose simple health status for infrastructure probes."""
    return {"status": "ok"}


@app.on_event("startup")
def on_startup() -> None:
    """Perform boot-time checks such as schema migrations."""
    database = get_database()
    initialize_workspace_storage(database)
    initialize_project_storage(database)


@app.exception_handler(APIError)
async def handle_api_error(request: Request, exc: APIError) -> JSONResponse:
    """Convert domain API errors into structured responses."""
    return JSONResponse(
        status_code=exc.http_status,
        content=APIResponse(code=exc.code, msg=exc.msg, data=exc.data).model_dump(),
    )


@app.exception_handler(RequestValidationError)
async def handle_validation_error(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Wrap validation errors in API response envelope."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=APIResponse.failure(
            code=4000,
            msg="validation error",
            data={"errors": exc.errors()},
        ).model_dump(),
    )


@app.exception_handler(StarletteHTTPException)
async def handle_http_exception(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    """Normalize FastAPI HTTP exceptions into API response format."""
    return JSONResponse(
        status_code=exc.status_code,
        content=APIResponse.failure(
            code=4000 + exc.status_code,
            msg=str(exc.detail or "error"),
            data={},
        ).model_dump(),
    )


@app.exception_handler(Exception)
async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
    """Ensure unhandled exceptions respond with standardized payload."""
    logger.exception("Unhandled error while processing request %s %s", request.method, request.url)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=APIResponse.failure(code=5000, msg="internal server error").model_dump(),
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("src.main:app", host="0.0.0.0", port=settings.port, reload=settings.debug)
