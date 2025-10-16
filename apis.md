# Workspace API Documentation

本文档描述 Workspace 相关接口的请求及返回格式。所有成功与失败响应均采用统一结构：

```json
{
  "code": 2000,
  "msg": "success",
  "data": {}
}
```

| 字段 | 类型 | 描述 |
| ---- | ---- | ---- |
| `code` | `number` | 业务状态码，成功为 `2000`，错误时对应具体错误码 |
| `msg` | `string` | 人类可读的提示信息 |
| `data` | `object` | 返回数据载荷；错误时通常为空对象或包含错误详情 |

错误响应示例：

```json
{
  "code": 3004,
  "msg": "Workspace '00000000-0000-0000-0000-000000000000' was not found",
  "data": {}
}
```

## 1. 创建 Workspace

- **方法**：`POST`
- **路径**：`/workspaces`
- **请求体参数**：

| 参数 | 类型 | 是否必填 | 说明 |
| ---- | ---- | -------- | ---- |
| `name` | `string` | 是 | Workspace 名称，必须唯一 |
| `description` | `string` | 否 | Workspace 描述 |

- **成功响应示例** `201 Created`：

```json
{
  "code": 2000,
  "msg": "workspace created",
  "data": {
    "workspace": {
      "uuid": "7e1e0d88-8d46-4bc7-9d3e-dcb5ef45e8c7",
      "name": "Research Lab",
      "description": "Exploring new AI agents",
      "create_time": "2024-05-01T12:34:56.789000+00:00"
    }
  }
}
```

- **错误响应示例**（名称重复，`409 Conflict`）：

```json
{
  "code": 3001,
  "msg": "Workspace name 'Research Lab' already exists",
  "data": {}
}
```

## 2. 获取 Workspace 详情

- **方法**：`GET`
- **路径**：`/workspaces/{workspace_id}`
- **路径参数**：

| 参数 | 类型 | 是否必填 | 说明 |
| ---- | ---- | -------- | ---- |
| `workspace_id` | `string` (UUID) | 是 | Workspace 唯一标识 |

- **成功响应示例** `200 OK`：

```json
{
  "code": 2000,
  "msg": "success",
  "data": {
    "workspace": {
      "uuid": "7e1e0d88-8d46-4bc7-9d3e-dcb5ef45e8c7",
      "name": "Research Lab",
      "description": "Exploring new AI agents",
      "create_time": "2024-05-01T12:34:56.789000+00:00"
    }
  }
}
```

- **错误响应示例**（不存在，`404 Not Found`）：

```json
{
  "code": 3004,
  "msg": "Workspace '00000000-0000-0000-0000-000000000000' was not found",
  "data": {}
}
```

## 5. 创建 Project

- **方法**：`POST`
- **路径**：`/projects`
- **请求体参数**：

| 参数 | 类型 | 是否必填 | 说明 |
| ---- | ---- | -------- | ---- |
| `workspace_uuid` | `string` (UUID) | 是 | 所属 workspace 标识 |
| `name` | `string` | 是 | Project 名称，需在 workspace 内唯一 |
| `description` | `string` | 否 | Project 描述 |
| `labels` | `string[]` | 否 | 标签列表 |
| `status_uuid` | `string` (UUID) | 否 | 状态标识 |
| `progress_uuid` | `string` (UUID) | 否 | 进度标识 |
| `ai_team_uuid` | `string` (UUID) | 否 | AI 团队标识 |
| `last_open_time` | `string` (ISO datetime) | 否 | 最近打开时间 |

- **成功响应示例** `201 Created`：

```json
{
  "code": 2000,
  "msg": "project created",
  "data": {
    "project": {
      "uuid": "d5c799a0-7f53-4a30-9f1d-2a1f1cf74699",
      "workspace_uuid": "7e1e0d88-8d46-4bc7-9d3e-dcb5ef45e8c7",
      "name": "Project Zephyr",
      "description": "Initial project",
      "labels": ["alpha", "beta"],
      "status_uuid": null,
      "progress_uuid": null,
      "ai_team_uuid": null,
      "create_time": "2024-05-01T12:34:56.789000+00:00",
      "last_open_time": "2024-05-01T12:34:56.789000+00:00"
    }
  }
}
```

- **错误响应示例**（workspace 不存在，`404 Not Found`）：

```json
{
  "code": 3004,
  "msg": "Workspace '00000000-0000-0000-0000-000000000000' was not found",
  "data": {}
}
```

- **错误响应示例**（名称重复，`409 Conflict`）：

```json
{
  "code": 3101,
  "msg": "Project name 'Project Zephyr' already exists",
  "data": {}
}
```

## 6. 获取 Project 详情

- **方法**：`GET`
- **路径**：`/projects/{project_uuid}`
- **路径参数**：

| 参数 | 类型 | 是否必填 | 说明 |
| ---- | ---- | -------- | ---- |
| `project_uuid` | `string` (UUID) | 是 | Project 唯一标识 |

- **成功响应示例** `200 OK`：

```json
{
  "code": 2000,
  "msg": "success",
  "data": {
    "project": {
      "uuid": "d5c799a0-7f53-4a30-9f1d-2a1f1cf74699",
      "workspace_uuid": "7e1e0d88-8d46-4bc7-9d3e-dcb5ef45e8c7",
      "name": "Project Zephyr",
      "description": "Initial project",
      "labels": ["alpha", "beta"],
      "status_uuid": null,
      "progress_uuid": null,
      "ai_team_uuid": null,
      "create_time": "2024-05-01T12:34:56.789000+00:00",
      "last_open_time": "2024-05-01T12:34:56.789000+00:00"
    }
  }
}
```

- **错误响应示例**（不存在，`404 Not Found`）：

```json
{
  "code": 3104,
  "msg": "Project '00000000-0000-0000-0000-000000000000' was not found",
  "data": {}
}
```

## 7. 获取 Project 列表

- **方法**：`GET`
- **路径**：`/projects`
- **查询参数**：

| 参数 | 类型 | 是否必填 | 默认值 | 说明 |
| ---- | ---- | -------- | ------ | ---- |
| `workspace_uuid` | `string` (UUID) | 是 | 需查询的 workspace |
| `page` | `number` | 否 | `1` | 页码 |
| `page_size` | `number` | 否 | `20` | 每页数量（1-100） |

- **成功响应示例** `200 OK`：

```json
{
  "code": 2000,
  "msg": "success",
  "data": {
    "projects": [
      {
        "uuid": "01d79c0e-e9c5-4fe0-8e8e-97a3fcea2c73",
        "workspace_uuid": "7e1e0d88-8d46-4bc7-9d3e-dcb5ef45e8c7",
        "name": "Project C",
        "description": null,
        "labels": [],
        "status_uuid": null,
        "progress_uuid": null,
        "ai_team_uuid": null,
        "create_time": "2024-05-02T08:30:12.345000+00:00",
        "last_open_time": "2024-05-02T08:30:12.345000+00:00"
      }
    ],
    "total": 3,
    "page": 1,
    "page_size": 1
  }
}
```

- **错误响应示例**（workspace 不存在，`404 Not Found`）：

```json
{
  "code": 3004,
  "msg": "Workspace '00000000-0000-0000-0000-000000000000' was not found",
  "data": {}
}
```

- **错误响应示例**（参数校验失败，`422 Unprocessable Entity`）：

```json
{
  "code": 4000,
  "msg": "validation error",
  "data": {
    "errors": [
      {
        "type": "missing",
        "loc": ["query", "workspace_uuid"],
        "msg": "Field required"
      }
    ]
  }
}
```

## 8. 更新 Project

- **方法**：`PATCH`
- **路径**：`/projects/{project_uuid}`
- **路径参数**：同「获取 Project 详情」
- **请求体参数**（均为可选字段）：

| 参数 | 类型 | 说明 |
| ---- | ---- | ---- |
| `workspace_uuid` | `string` (UUID) | 更新归属 workspace |
| `name` | `string` | 更新项目名称 |
| `description` | `string` | 更新描述 |
| `labels` | `string[]` | 更新标签 |
| `status_uuid` | `string` (UUID) | 更新状态标识 |
| `progress_uuid` | `string` (UUID) | 更新进度标识 |
| `ai_team_uuid` | `string` (UUID) | 更新团队标识 |
| `last_open_time` | `string` (ISO datetime) | 更新最近打开时间 |

- **成功响应示例** `200 OK`：

```json
{
  "code": 2000,
  "msg": "project updated",
  "data": {
    "project": {
      "uuid": "d5c799a0-7f53-4a30-9f1d-2a1f1cf74699",
      "workspace_uuid": "7e1e0d88-8d46-4bc7-9d3e-dcb5ef45e8c7",
      "name": "Project Zephyr",
      "description": "Updated description",
      "labels": ["alpha", "beta", "gamma"],
      "status_uuid": null,
      "progress_uuid": null,
      "ai_team_uuid": null,
      "create_time": "2024-05-01T12:34:56.789000+00:00",
      "last_open_time": "2024-05-03T09:00:00.000000+00:00"
    }
  }
}
```

- **错误响应示例**（更新名称冲突，`409 Conflict`）：

```json
{
  "code": 3101,
  "msg": "Project name 'Project Zephyr' already exists",
  "data": {}
}
```

- **错误响应示例**（不存在，`404 Not Found`）：

```json
{
  "code": 3104,
  "msg": "Project '00000000-0000-0000-0000-000000000000' was not found",
  "data": {}
}
```

## 9. 删除 Project

- **方法**：`DELETE`
- **路径**：`/projects/{project_uuid}`
- **路径参数**：同「获取 Project 详情」

- **成功响应示例** `200 OK`：

```json
{
  "code": 2000,
  "msg": "project deleted",
  "data": {}
}
```

- **错误响应示例**（不存在，`404 Not Found`）：

```json
{
  "code": 3104,
  "msg": "Project '00000000-0000-0000-0000-000000000000' was not found",
  "data": {}
}
```

## 3. 获取 Workspace 列表

- **方法**：`GET`
- **路径**：`/workspaces`
- **查询参数**：

| 参数 | 类型 | 是否必填 | 默认值 | 说明 |
| ---- | ---- | -------- | ------ | ---- |
| `page` | `number` | 否 | `1` | 页码，最小为 1 |
| `page_size` | `number` | 否 | `20` | 每页数量，范围 1-100 |

- **成功响应示例** `200 OK`：

```json
{
  "code": 2000,
  "msg": "success",
  "data": {
    "workspaces": [
      {
        "uuid": "d7d3ce42-93e0-4c2c-90d6-e5521b516b54",
        "name": "Workspace C",
        "description": "Latest created workspace",
        "create_time": "2024-05-02T08:30:12.345000+00:00"
      },
      {
        "uuid": "3d4ae9d4-6b73-4fc7-bc8f-4f2684a83c27",
        "name": "Workspace B",
        "description": "Second workspace",
        "create_time": "2024-05-02T08:25:00.000000+00:00"
      }
    ],
    "total": 3,
    "page": 1,
    "page_size": 2
  }
}
```

- **错误响应示例**（页参数校验失败，`422 Unprocessable Entity`）：

```json
{
  "code": 4000,
  "msg": "validation error",
  "data": {
    "errors": [
      {
        "type": "greater_than_equal",
        "loc": ["query", "page"],
        "msg": "Input should be greater than or equal to 1",
        "input": 0
      }
    ]
  }
}
```

## 4. 删除 Workspace

- **方法**：`DELETE`
- **路径**：`/workspaces/{workspace_id}`
- **路径参数**：同「获取 Workspace 详情」

- **成功响应示例** `200 OK`：

```json
{
  "code": 2000,
  "msg": "workspace deleted",
  "data": {}
}
```

- **错误响应示例**（不存在，`404 Not Found`）：

```json
{
  "code": 3004,
  "msg": "Workspace '00000000-0000-0000-0000-000000000000' was not found",
  "data": {}
}
```
