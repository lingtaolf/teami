export interface WorkspaceRecord {
  id: number;
  workspace_uuid: string;
  name: string;
  description: string;
  create_time: string;
  last_open_time: string;
}

export interface ProjectRecord {
  id: number;
  workspace_uuid: string;
  project_uuid: string;
  project_name: string;
  description: string;
  create_time: string;
  last_open_time: string;
  team_uuid: string | null;
  status: 'READY' | 'ACTIVE' | 'COMPLETED' | 'PLANNING';
  labels: string; // JSON string array
  progress: number;
}

export interface TeamiNativeAPI {
  version: string;
  workspaces: {
    list: () => Promise<WorkspaceRecord[]>;
    create: (payload: { name: string; description?: string }) => Promise<WorkspaceRecord>;
    update: (workspaceId: number, payload: { name: string; description?: string }) => Promise<WorkspaceRecord>;
    updateLastOpen: (workspaceId: number) => Promise<WorkspaceRecord>;
    delete: (workspaceId: number) => Promise<{ success: boolean }>;
  };
  projects: {
    list: (workspaceUuid: string) => Promise<ProjectRecord[]>;
    create: (payload: { 
      workspaceUuid: string; 
      project_name: string; 
      description?: string; 
      team_uuid?: string;
      status?: 'READY' | 'ACTIVE' | 'COMPLETED' | 'PLANNING';
      labels?: string[];
      progress?: number;
    }) => Promise<ProjectRecord>;
    update: (projectUuid: string, payload: { 
      project_name: string; 
      description?: string; 
      team_uuid?: string;
      status?: 'READY' | 'ACTIVE' | 'COMPLETED' | 'PLANNING';
      labels?: string[];
      progress?: number;
    }) => Promise<ProjectRecord>;
    updateLastOpen: (projectUuid: string) => Promise<ProjectRecord>;
    delete: (projectUuid: string) => Promise<{ success: boolean }>;
  };
}

declare global {
  interface Window {
    teamiNative?: TeamiNativeAPI;
  }
}

export {};
