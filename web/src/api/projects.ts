import type {
  ProjectCreateRequest,
  ProjectPagePayload,
  ProjectPayload,
  ProjectRead,
  ProjectUpdateRequest
} from './projects.types';

const DEFAULT_BASE_URL = 'http://127.0.0.1:8000';

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ??
  DEFAULT_BASE_URL;

interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}/projects${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });

  const json = (await response.json()) as ApiResponse<T>;
  if (!response.ok || json.code !== 2000) {
    const message = json?.msg || `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return json.data;
}

export async function createProject(
  payload: ProjectCreateRequest
): Promise<ProjectRead> {
  const data = await request<ProjectPayload>('', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return data.project;
}

export async function updateProject(
  projectUuid: string,
  payload: ProjectUpdateRequest
): Promise<ProjectRead> {
  const data = await request<ProjectPayload>(`/${projectUuid}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  return data.project;
}

export async function deleteProject(projectUuid: string): Promise<void> {
  await request<Record<string, never>>(`/${projectUuid}`, {
    method: 'DELETE'
  });
}

export async function getProject(projectUuid: string): Promise<ProjectRead> {
  const data = await request<ProjectPayload>(`/${projectUuid}`, {
    method: 'GET'
  });
  return data.project;
}

export async function listProjects(params: {
  workspaceUuid: string;
  page?: number;
  page_size?: number;
}): Promise<ProjectPagePayload> {
  const search = new URLSearchParams();
  search.set('workspace_uuid', params.workspaceUuid);
  if (params.page) search.set('page', String(params.page));
  if (params.page_size) search.set('page_size', String(params.page_size));
  const query = search.toString();
  const path = query.length ? `?${query}` : '';
  return request<ProjectPagePayload>(path, { method: 'GET' });
}
