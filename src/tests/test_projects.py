from __future__ import annotations

import importlib
import sys
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(tmp_path, monkeypatch):
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("DATABASE_PATH", str(db_path))
    monkeypatch.delenv("CORS_ORIGINS", raising=False)

    from src.config import get_settings
    from src.db import get_database

    get_settings.cache_clear()
    get_database.cache_clear()

    module_name = "src.main"
    if module_name in sys.modules:
        del sys.modules[module_name]

    main = importlib.import_module(module_name)

    with TestClient(main.app) as test_client:
        yield test_client


def create_workspace(client: TestClient, name: str = "Workspace Alpha") -> str:
    response = client.post(
        "/workspaces",
        json={
            "name": name,
            "description": f"{name} description",
        },
    )
    assert response.status_code == 201
    return response.json()["data"]["workspace"]["uuid"]


def test_create_project(client: TestClient) -> None:
    workspace_uuid = create_workspace(client)

    response = client.post(
        "/projects",
        json={
            "workspace_uuid": workspace_uuid,
            "name": "Project Zephyr",
            "description": "Initial project",
            "labels": ["alpha", "beta"],
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["code"] == 2000
    project = payload["data"]["project"]
    assert project["workspace_uuid"] == workspace_uuid
    assert project["name"] == "Project Zephyr"
    assert project["labels"] == ["alpha", "beta"]
    assert "uuid" in project


def test_create_project_duplicate_name(client: TestClient) -> None:
    workspace_uuid = create_workspace(client)

    body = {
        "workspace_uuid": workspace_uuid,
        "name": "Project Zephyr",
    }

    first = client.post("/projects", json=body)
    assert first.status_code == 201

    duplicate = client.post("/projects", json=body)
    assert duplicate.status_code == 409
    payload = duplicate.json()
    assert payload["code"] == 3101


def test_create_project_workspace_not_found(client: TestClient) -> None:
    response = client.post(
        "/projects",
        json={
            "workspace_uuid": str(uuid4()),
            "name": "Ghost Project",
        },
    )
    assert response.status_code == 404
    payload = response.json()
    assert payload["code"] == 3004


def test_get_project(client: TestClient) -> None:
    workspace_uuid = create_workspace(client)
    creation = client.post(
        "/projects",
        json={
            "workspace_uuid": workspace_uuid,
            "name": "Project A",
        },
    )
    project_uuid = creation.json()["data"]["project"]["uuid"]

    response = client.get(f"/projects/{project_uuid}")
    assert response.status_code == 200
    payload = response.json()
    assert payload["code"] == 2000
    project = payload["data"]["project"]
    assert project["uuid"] == project_uuid
    assert project["workspace_uuid"] == workspace_uuid


def test_get_project_not_found(client: TestClient) -> None:
    response = client.get(f"/projects/{uuid4()}")
    assert response.status_code == 404
    payload = response.json()
    assert payload["code"] == 3104


def test_list_projects(client: TestClient) -> None:
    workspace_uuid = create_workspace(client)
    for name in ["Project A", "Project B", "Project C"]:
        res = client.post(
            "/projects",
            json={
                "workspace_uuid": workspace_uuid,
                "name": name,
            },
        )
        assert res.status_code == 201

    response = client.get(
        "/projects",
        params={
            "workspace_uuid": workspace_uuid,
            "page": 1,
            "page_size": 2,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["code"] == 2000
    data = payload["data"]
    assert data["total"] == 3
    assert len(data["projects"]) == 2


def test_update_project(client: TestClient) -> None:
    workspace_uuid = create_workspace(client)
    creation = client.post(
        "/projects",
        json={
            "workspace_uuid": workspace_uuid,
            "name": "Project A",
            "description": "Initial",
            "labels": ["old"],
        },
    )
    project_uuid = creation.json()["data"]["project"]["uuid"]

    response = client.patch(
        f"/projects/{project_uuid}",
        json={
            "description": "Updated",
            "labels": ["new", "tags"],
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["code"] == 2000
    project = payload["data"]["project"]
    assert project["description"] == "Updated"
    assert project["labels"] == ["new", "tags"]


def test_update_project_conflict(client: TestClient) -> None:
    workspace_uuid = create_workspace(client)
    projects = []
    for name in ["Project A", "Project B"]:
        res = client.post(
            "/projects",
            json={
                "workspace_uuid": workspace_uuid,
                "name": name,
            },
        )
        projects.append(res.json()["data"]["project"]["uuid"])

    response = client.patch(
        f"/projects/{projects[0]}",
        json={
            "name": "Project B",
        },
    )
    assert response.status_code == 409
    payload = response.json()
    assert payload["code"] == 3101


def test_delete_project(client: TestClient) -> None:
    workspace_uuid = create_workspace(client)
    creation = client.post(
        "/projects",
        json={
            "workspace_uuid": workspace_uuid,
            "name": "Project A",
        },
    )
    project_uuid = creation.json()["data"]["project"]["uuid"]

    response = client.delete(f"/projects/{project_uuid}")
    assert response.status_code == 200
    payload = response.json()
    assert payload["code"] == 2000

    missing = client.get(f"/projects/{project_uuid}")
    assert missing.status_code == 404
    assert missing.json()["code"] == 3104


def test_delete_project_not_found(client: TestClient) -> None:
    response = client.delete(f"/projects/{uuid4()}")
    assert response.status_code == 404
    payload = response.json()
    assert payload["code"] == 3104
