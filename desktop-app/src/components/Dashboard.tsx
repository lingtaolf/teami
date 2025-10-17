import { useState, useMemo } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft, 
  ChevronRight,
  Plus,
  Activity
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ProjectCard } from './ProjectCard';
import { ProjectForm, type ProjectFormData } from './ProjectForm';
import { ProjectStats } from './ProjectStats';
import { useProjects } from '../hooks/useProjects';
import { confirmDialog, parseLabels, getRelativeTime } from '../utils';
import { APP_CONSTANTS } from '../constants';
import type { WorkspaceRecord, ProjectRecord } from '../types/global';

interface DashboardProps {
  currentWorkspace: WorkspaceRecord | null;
  onBackToWorkspaces: () => void;
  onCreateProject: () => void;
  onOpenProject: (projectId: string) => void;
}

export function Dashboard({ currentWorkspace, onBackToWorkspaces }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRecord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    updateLastOpen
  } = useProjects({ currentWorkspace });

  const totalPages = projects.length === 0 ? 0 : Math.ceil(projects.length / APP_CONSTANTS.PROJECT_PAGE_SIZE);
  
  const paginatedProjects = useMemo(() => {
    const start = currentPage * APP_CONSTANTS.PROJECT_PAGE_SIZE;
    return projects.slice(start, start + APP_CONSTANTS.PROJECT_PAGE_SIZE);
  }, [projects, currentPage]);

  // 分页控制
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    if (totalPages === 0) return;
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  // 项目操作
  const handleOpenProject = async (project: ProjectRecord) => {
    try {
      await updateLastOpen(project.project_uuid);
    } catch (error) {
      console.error('Failed to update last open time:', error);
    }
  };

  const handleCreateProject = async (data: ProjectFormData) => {
    const labelsArray = data.labels.split(',').map(l => l.trim()).filter(Boolean);
    await createProject({
      project_name: data.name,
      description: data.description,
      labels: labelsArray
    });
    setCurrentPage(0); // 回到第一页显示新创建的项目
  };

  const handleOpenSettings = (project: ProjectRecord) => {
    setEditingProject(project);
    setIsEditDialogOpen(true);
  };

  const handleUpdateProject = async (data: ProjectFormData) => {
    if (!editingProject) return;
    
    const labelsArray = data.labels.split(',').map(l => l.trim()).filter(Boolean);
    await updateProject(editingProject.project_uuid, {
      project_name: data.name,
      description: data.description,
      labels: labelsArray
    });
    setEditingProject(null);
  };

  const handleDeleteProject = async (projectUuid: string) => {
    const confirmed = await confirmDialog('确认删除该项目吗？此操作不可撤销。');
    if (confirmed) {
      await deleteProject(projectUuid);
    }
  };

  // 准备编辑表单的初始数据
  const getEditFormData = (): ProjectFormData | undefined => {
    if (!editingProject) return undefined;
    
    const labels = parseLabels(editingProject.labels);
    return {
      name: editingProject.project_name,
      description: editingProject.description || '',
      labels: labels.join(', ')
    };
  };

  if (!currentWorkspace) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="max-w-lg text-center space-y-3">
          <h1 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            No Workspace Selected
          </h1>
          <p className="text-slate-600 text-sm">Please select a workspace to view projects.</p>
          <Button onClick={onBackToWorkspaces}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workspaces
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBackToWorkspaces}
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回工作区
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">Projects</h1>
              <p className="text-slate-600">Manage your AI-powered projects in "{currentWorkspace.name}"</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Project
          </Button>
        </div>

        {/* Stats */}
        <ProjectStats projects={projects} />

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="border-0 bg-red-50 shadow-lg max-w-xl mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Projects Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Your Projects</h2>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-slate-500 px-2">
                  {currentPage + 1} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages - 1}
                  className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-6">
              {[...Array(APP_CONSTANTS.PROJECT_PAGE_SIZE)].map((_, index) => (
                <Card key={index} className="p-6 border-0 shadow-lg bg-white animate-pulse">
                  <div className="h-5 w-2/3 rounded bg-slate-200 mb-4" />
                  <div className="h-4 w-full rounded bg-slate-100 mb-2" />
                  <div className="h-4 w-3/4 rounded bg-slate-100" />
                </Card>
              ))}
            </div>
          ) : paginatedProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-indigo-200 bg-white/70 p-10 text-center space-y-3">
              <h3 className="text-lg font-medium text-slate-900">还没有项目</h3>
              <p className="text-sm text-slate-600">点击右上角的「Create New Project」即可开始。</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {paginatedProjects.map((project) => (
                <ProjectCard
                  key={project.project_uuid}
                  project={project}
                  onOpenProject={handleOpenProject}
                  onOpenSettings={handleOpenSettings}
                  onDeleteProject={handleDeleteProject}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h2>
          <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50/30">
            <div className="space-y-4">
              {projects.slice(0, 3).map((project) => (
                <div key={project.project_uuid} className="flex items-start gap-4 pb-4 border-b border-indigo-100 last:border-0 last:pb-0">
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mt-2 shadow-lg" />
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{project.project_name}</div>
                    <div className="text-sm text-slate-600">Project updated with new features</div>
                  </div>
                  <div className="text-sm text-slate-500">{getRelativeTime(project.last_open_time)}</div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="text-center text-slate-500 py-8">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                  <p>No recent activity</p>
                  <p className="text-sm">Create your first project to see activity here</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Create Project Dialog */}
        <ProjectForm
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreateProject}
          title="创建新项目"
          description="创建一个新的项目。"
          submitButtonText="创建项目"
          workspaceName={currentWorkspace.name}
        />

        {/* Edit Project Dialog */}
        <ProjectForm
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingProject(null);
          }}
          onSubmit={handleUpdateProject}
          initialData={getEditFormData()}
          title="编辑项目"
          description="修改项目的名称和描述信息。"
          submitButtonText="保存修改"
        />
      </div>
    </div>
  );
}