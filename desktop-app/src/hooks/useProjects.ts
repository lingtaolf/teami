import { useState, useEffect, useMemo } from 'react';
import type { ProjectRecord, WorkspaceRecord } from '../types/global';

interface UseProjectsProps {
  currentWorkspace: WorkspaceRecord | null;
}

interface UseProjectsReturn {
  projects: ProjectRecord[];
  loading: boolean;
  error: string | null;
  refreshProjects: () => Promise<void>;
  createProject: (data: CreateProjectData) => Promise<void>;
  updateProject: (projectUuid: string, data: UpdateProjectData) => Promise<void>;
  deleteProject: (projectUuid: string) => Promise<void>;
  updateLastOpen: (projectUuid: string) => Promise<void>;
}

interface CreateProjectData {
  project_name: string;
  description?: string;
  labels?: string[];
}

interface UpdateProjectData {
  project_name: string;
  description?: string;
  labels?: string[];
}

export function useProjects({ currentWorkspace }: UseProjectsProps): UseProjectsReturn {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const projectApi = typeof window !== 'undefined' ? window.teamiNative?.projects : undefined;
  const apiUnavailableMessage = '本地 project API 未初始化，请通过桌面客户端访问。';

  // 按最近打开时间排序的项目
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      return new Date(b.last_open_time).getTime() - new Date(a.last_open_time).getTime();
    });
  }, [projects]);

  const refreshProjects = async () => {
    if (!projectApi || !currentWorkspace) {
      setLoading(false);
      setError(currentWorkspace ? apiUnavailableMessage : 'No workspace selected');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const entries = await projectApi.list(currentWorkspace.workspace_uuid);
      setProjects(entries);
    } catch (err) {
      const message = err instanceof Error ? err.message : '无法加载项目列表';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (data: CreateProjectData) => {
    if (!projectApi || !currentWorkspace) {
      throw new Error(apiUnavailableMessage);
    }

    await projectApi.create({
      workspaceUuid: currentWorkspace.workspace_uuid,
      project_name: data.project_name,
      description: data.description || '',
      status: 'READY',
      labels: data.labels || [],
      progress: Math.floor(Math.random() * 50) + 25 // Random progress between 25-75%
    });

    await refreshProjects();
  };

  const updateProject = async (projectUuid: string, data: UpdateProjectData) => {
    if (!projectApi) {
      throw new Error(apiUnavailableMessage);
    }

    await projectApi.update(projectUuid, {
      project_name: data.project_name,
      description: data.description || '',
      labels: data.labels || []
    });

    await refreshProjects();
  };

  const deleteProject = async (projectUuid: string) => {
    if (!projectApi) {
      throw new Error(apiUnavailableMessage);
    }

    await projectApi.delete(projectUuid);
    await refreshProjects();
  };

  const updateLastOpen = async (projectUuid: string) => {
    if (!projectApi) {
      throw new Error(apiUnavailableMessage);
    }

    await projectApi.updateLastOpen(projectUuid);
    await refreshProjects();
  };

  useEffect(() => {
    refreshProjects();
  }, [projectApi, currentWorkspace]);

  return {
    projects: sortedProjects,
    loading,
    error,
    refreshProjects,
    createProject,
    updateProject,
    deleteProject,
    updateLastOpen
  };
}