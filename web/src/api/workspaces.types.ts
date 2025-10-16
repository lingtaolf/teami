export interface WorkspaceRead {
  uuid: string;
  name: string;
  description: string | null;
  create_time: string;
}

export interface WorkspaceListPayload {
  workspaces: WorkspaceRead[];
  total: number;
  page: number;
  page_size: number;
}

export interface WorkspacePage {
  items: WorkspaceRead[];
  total: number;
  page: number;
  page_size: number;
}

export interface WorkspaceCreatePayload {
  workspace: WorkspaceRead;
}
