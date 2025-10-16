from __future__ import annotations

import importlib
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
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


def test_create_workspace(client: TestClient) -> None:
    response = client.post(
        "/workspaces",
        json={
            "name": "Research Lab",
            "description": "Exploring new AI agents",
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["code"] == 2000
    workspace = payload["data"]["workspace"]
    assert workspace["name"] == "Research Lab"
    assert workspace["description"] == "Exploring new AI agents"
    assert "uuid" in workspace
    assert "create_time" in workspace


def test_create_workspace_duplicate_name(client: TestClient) -> None:
    body = {
        "name": "Research Lab",
        "description": "Exploring new AI agents",
    }
    first = client.post("/workspaces", json=body)
    assert first.status_code == 201
    assert first.json()["code"] == 2000

    duplicate = client.post("/workspaces", json=body)
    assert duplicate.status_code == 409
    dup_payload = duplicate.json()
    assert dup_payload["code"] == 3001
    assert "already exists" in dup_payload["msg"]


def test_get_workspace(client: TestClient) -> None:
    creation = client.post(
        "/workspaces",
        json={
            "name": "Design Studio",
            "description": "Product design collaboration",
        },
    )
    workspace_id = creation.json()["data"]["workspace"]["uuid"]

    fetch = client.get(f"/workspaces/{workspace_id}")
    assert fetch.status_code == 200
    payload = fetch.json()
    assert payload["code"] == 2000
    workspace = payload["data"]["workspace"]
    assert workspace["uuid"] == workspace_id
    assert workspace["name"] == "Design Studio"
    assert workspace["description"] == "Product design collaboration"
    assert "create_time" in workspace


def test_get_workspace_not_found(client: TestClient) -> None:
    response = client.get("/workspaces/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
    payload = response.json()
    assert payload["code"] == 3004


def test_cors_preflight(client: TestClient) -> None:
    response = client.options(
        "/workspaces",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
    allow_methods = response.headers.get("access-control-allow-methods", "")
    assert allow_methods == "*" or "POST" in allow_methods


def test_list_workspaces_pagination(client: TestClient) -> None:
    names = ["Workspace A", "Workspace B", "Workspace C"]
    for name in names:
        response = client.post(
            "/workspaces",
            json={
                "name": name,
                "description": f"Description for {name}",
            },
        )
        assert response.status_code == 201

    page_response = client.get("/workspaces", params={"page": 1, "page_size": 2})
    assert page_response.status_code == 200
    payload = page_response.json()
    assert payload["code"] == 2000
    page_data = payload["data"]

    assert page_data["page"] == 1
    assert page_data["page_size"] == 2
    assert page_data["total"] == 3
    assert len(page_data["workspaces"]) == 2

    # Items should be ordered by create_time descending (latest first)
    returned_names = [item["name"] for item in page_data["workspaces"]]
    assert returned_names == ["Workspace C", "Workspace B"]

    second_page = client.get("/workspaces", params={"page": 2, "page_size": 2})
    assert second_page.status_code == 200
    payload_second = second_page.json()
    assert payload_second["code"] == 2000
    second_data = payload_second["data"]
    assert second_data["page"] == 2
    assert second_data["total"] == 3
    assert len(second_data["workspaces"]) == 1
    assert second_data["workspaces"][0]["name"] == "Workspace A"


def test_delete_workspace(client: TestClient) -> None:
    creation = client.post(
        "/workspaces",
        json={
            "name": "Sandbox",
            "description": "Temporary space",
        },
    )
    workspace_id = creation.json()["data"]["workspace"]["uuid"]

    response = client.delete(f"/workspaces/{workspace_id}")
    assert response.status_code == 200
    delete_payload = response.json()
    assert delete_payload["code"] == 2000

    fetch_after_delete = client.get(f"/workspaces/{workspace_id}")
    assert fetch_after_delete.status_code == 404
    fetch_payload = fetch_after_delete.json()
    assert fetch_payload["code"] == 3004


def test_delete_workspace_not_found(client: TestClient) -> None:
    response = client.delete("/workspaces/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
    payload = response.json()
    assert payload["code"] == 3004
