import type {
  WorkspaceCreatePayload,
  WorkspaceListPayload,
  WorkspacePage,
  WorkspaceRead
} from './workspaces.types';

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
  const response = await fetch(`${API_BASE}/workspaces${path}`, {
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

export async function createWorkspace(payload: {
  name: string;
  description?: string | null;
}): Promise<WorkspaceRead> {
  const data = await request<WorkspaceCreatePayload>(
    '',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );
  return data.workspace;
}

export async function listWorkspaces(params: {
  page?: number;
  page_size?: number;
} = {}): Promise<WorkspacePage> {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.page_size) search.set('page_size', String(params.page_size));
  const query = search.toString();
  const path = query.length ? `?${query}` : '';
  const data = await request<WorkspaceListPayload>(
    path,
    { method: 'GET' }
  );
  return {
    items: data.workspaces,
    total: data.total,
    page: data.page,
    page_size: data.page_size
  };
}

export async function getWorkspace(workspaceId: string): Promise<WorkspaceRead> {
  const data = await request<WorkspaceCreatePayload>(
    `/${workspaceId}`,
    {
      method: 'GET'
    }
  );
  return data.workspace;
}
