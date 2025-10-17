export interface WorkspaceRecord {
  id: number;
  name: string;
  description: string;
  create_time: string;
  last_open_time: string;
}

export interface TeamiNativeAPI {
  version: string;
  workspaces: {
    list: () => Promise<WorkspaceRecord[]>;
    create: (payload: { name: string; description?: string }) => Promise<WorkspaceRecord>;
    updateLastOpen: (workspaceId: number) => Promise<WorkspaceRecord>;
    delete: (workspaceId: number) => Promise<{ success: boolean }>;
  };
}

declare global {
  interface Window {
    teamiNative?: TeamiNativeAPI;
  }
}

export {};
