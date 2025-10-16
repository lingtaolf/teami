from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from fastapi.concurrency import run_in_threadpool

from src.db import Database, get_database
from src.schemas.api_response import APIResponse
from src.schemas.workspaces import WorkspaceCreate, WorkspaceRead, WorkspacePage

from . import service

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.get(
    "",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="List workspaces",
)
async def list_workspaces_endpoint(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    database: Database = Depends(get_database),
) -> APIResponse:
    items, total = await run_in_threadpool(
        service.list_workspaces, database, page=page, page_size=page_size
    )
    response = WorkspacePage(
        items=[WorkspaceRead.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )
    return APIResponse.success(
        data={
            "workspaces": [item.model_dump() for item in response.items],
            "total": response.total,
            "page": response.page,
            "page_size": response.page_size,
        }
    )


@router.post(
    "",
    response_model=APIResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create workspace",
)
async def create_workspace_endpoint(
    payload: WorkspaceCreate,
    database: Database = Depends(get_database),
) -> APIResponse:
    workspace = await run_in_threadpool(service.create_workspace, database, payload)
    workspace_read = WorkspaceRead.model_validate(workspace)
    return APIResponse.success(
        data={"workspace": workspace_read.model_dump()},
        msg="workspace created",
    )


@router.get(
    "/{workspace_id}",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Get workspace",
)
async def get_workspace_endpoint(
    workspace_id: UUID,
    database: Database = Depends(get_database),
) -> APIResponse:
    workspace = await run_in_threadpool(service.fetch_workspace, database, workspace_id)
    workspace_read = WorkspaceRead.model_validate(workspace)
    return APIResponse.success(data={"workspace": workspace_read.model_dump()})


@router.delete(
    "/{workspace_id}",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete workspace",
)
async def delete_workspace_endpoint(
    workspace_id: UUID,
    database: Database = Depends(get_database),
) -> APIResponse:
    await run_in_threadpool(service.delete_workspace, database, workspace_id)
    return APIResponse.success(data={}, msg="workspace deleted")
