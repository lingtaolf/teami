export interface ProjectRead {
  uuid: string;
  workspace_uuid: string;
  name: string;
  description: string | null;
  labels: string[];
  status_uuid: string | null;
  progress_uuid: string | null;
  ai_team_uuid: string | null;
  create_time: string;
  last_open_time: string | null;
}

export interface ProjectCreateRequest {
  workspace_uuid: string;
  name: string;
  description?: string | null;
  labels?: string[];
  status_uuid?: string | null;
  progress_uuid?: string | null;
  ai_team_uuid?: string | null;
  last_open_time?: string | null;
}

export interface ProjectUpdateRequest {
  name?: string;
  description?: string | null;
  labels?: string[];
  status_uuid?: string | null;
  progress_uuid?: string | null;
  ai_team_uuid?: string | null;
  last_open_time?: string | null;
}

export interface ProjectPagePayload {
  projects: ProjectRead[];
  total: number;
  page: number;
  page_size: number;
}

export interface ProjectPayload {
  project: ProjectRead;
}
