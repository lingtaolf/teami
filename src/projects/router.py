from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from fastapi.concurrency import run_in_threadpool

from src.db import Database, get_database
from src.schemas.api_response import APIResponse
from src.schemas.projects import ProjectCreate, ProjectPage, ProjectRead, ProjectUpdate

from . import service

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post(
    "",
    response_model=APIResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create project",
)
async def create_project_endpoint(
    payload: ProjectCreate,
    database: Database = Depends(get_database),
) -> APIResponse:
    project = await run_in_threadpool(service.create_project, database, payload)
    project_read = ProjectRead.model_validate(project)
    return APIResponse.success(
        data={"project": project_read.model_dump()},
        msg="project created",
    )


@router.get(
    "/{project_uuid}",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Get project",
)
async def get_project_endpoint(
    project_uuid: UUID,
    database: Database = Depends(get_database),
) -> APIResponse:
    project = await run_in_threadpool(service.fetch_project, database, project_uuid)
    project_read = ProjectRead.model_validate(project)
    return APIResponse.success(data={"project": project_read.model_dump()})


@router.get(
    "",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="List projects",
)
async def list_projects_endpoint(
    workspace_uuid: UUID = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    database: Database = Depends(get_database),
) -> APIResponse:
    items, total = await run_in_threadpool(
        service.list_projects,
        database,
        workspace_uuid=workspace_uuid,
        page=page,
        page_size=page_size,
    )
    page_read = ProjectPage(
        projects=[ProjectRead.model_validate(project) for project in items],
        total=total,
        page=page,
        page_size=page_size,
    )
    return APIResponse.success(
        data={
            "projects": [project.model_dump() for project in page_read.projects],
            "total": page_read.total,
            "page": page_read.page,
            "page_size": page_read.page_size,
        }
    )


@router.patch(
    "/{project_uuid}",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Update project",
)
async def update_project_endpoint(
    project_uuid: UUID,
    payload: ProjectUpdate,
    database: Database = Depends(get_database),
) -> APIResponse:
    project = await run_in_threadpool(service.update_project, database, project_uuid, payload)
    project_read = ProjectRead.model_validate(project)
    return APIResponse.success(
        data={"project": project_read.model_dump()},
        msg="project updated",
    )


@router.delete(
    "/{project_uuid}",
    response_model=APIResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete project",
)
async def delete_project_endpoint(
    project_uuid: UUID,
    database: Database = Depends(get_database),
) -> APIResponse:
    await run_in_threadpool(service.delete_project, database, project_uuid)
    return APIResponse.success(data={}, msg="project deleted")
