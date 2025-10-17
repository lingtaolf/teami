import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft, 
  ChevronRight,
  Clock,
  Plus,
  Settings,
  Trash2,
  CalendarClock,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import type { WorkspaceRecord, ProjectRecord } from '../types/global';

interface DashboardProps {
  currentWorkspace: WorkspaceRecord | null;
  onBackToWorkspaces: () => void;
  onCreateProject: () => void;
  onOpenProject: (projectId: string) => void;
}

const PAGE_SIZE = 4;
const NAME_LIMIT = 30;
const DESCRIPTION_LIMIT = 100;

const initialForm = {
  name: '',
  description: ''
};

function formatDateTime(value?: string | null) {
  if (!value) {
    return '尚未打开';
  }
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hour}:${minute}`;
  } catch {
    return value;
  }
}

export function Dashboard({ currentWorkspace, onBackToWorkspaces }: DashboardProps) {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState(initialForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRecord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormValues, setEditFormValues] = useState(initialForm);
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const projectApi = typeof window !== 'undefined' ? window.teamiNative?.projects : undefined;
  const apiUnavailableMessage = '本地 project API 未初始化，请通过桌面客户端访问。';

  // 按最近打开时间排序的项目
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      return new Date(b.last_open_time).getTime() - new Date(a.last_open_time).getTime();
    });
  }, [projects]);

  const totalPages = sortedProjects.length === 0 ? 0 : Math.ceil(sortedProjects.length / PAGE_SIZE);
  
  const paginatedProjects = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return sortedProjects.slice(start, start + PAGE_SIZE);
  }, [sortedProjects, currentPage]);

  const placeholderCount = Math.max(0, PAGE_SIZE - paginatedProjects.length);

  async function refreshProjects(api = projectApi) {
    if (!api || !currentWorkspace) {
      setLoading(false);
      setListError(currentWorkspace ? apiUnavailableMessage : 'No workspace selected');
      return;
    }

    setLoading(true);
    setListError(null);
    try {
      const entries = await api.list(currentWorkspace.workspace_uuid);
      setProjects(entries);
    } catch (error) {
      const message = error instanceof Error ? error.message : '无法加载项目列表';
      setListError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenProject(project: ProjectRecord) {
    try {
      const api = projectApi;
      if (!api) {
        setListError(apiUnavailableMessage);
        return;
      }

      // 更新最后访问时间
      await api.updateLastOpen(project.project_uuid);
      await refreshProjects(api);
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新项目信息失败';
      setListError(message);
    }
  }

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentWorkspace) {
      setFormError('No workspace selected');
      return;
    }

    const name = formValues.name.trim();
    const description = formValues.description.trim();

    if (!name) {
      setFormError('项目名称不能为空');
      return;
    }

    setCreating(true);
    setFormError(null);

    try {
      const api = projectApi;
      if (!api) {
        setFormError(apiUnavailableMessage);
        setCreating(false);
        return;
      }

      await api.create({
        workspaceUuid: currentWorkspace.workspace_uuid,
        project_name: name,
        description
      });
      setFormValues(initialForm);
      setIsDialogOpen(false);
      setCurrentPage(0);
      await refreshProjects(api);
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建项目失败';
      setFormError(message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteProject(projectUuid: string) {
    const api = projectApi;
    if (!api) {
      setListError(apiUnavailableMessage);
      return;
    }

    const confirmed = window.confirm('确认删除该项目吗？此操作不可撤销。');
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(projectUuid);
      await refreshProjects(api);
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除项目失败';
      setListError(message);
    }
  }

  function handleOpenSettings(project: ProjectRecord) {
    setEditingProject(project);
    setEditFormValues({
      name: project.project_name,
      description: project.description || ''
    });
    setEditFormError(null);
    setIsEditDialogOpen(true);
  }

  async function handleUpdateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingProject) return;

    const name = editFormValues.name.trim();
    const description = editFormValues.description.trim();

    if (!name) {
      setEditFormError('项目名称不能为空');
      return;
    }

    setUpdating(true);
    setEditFormError(null);

    try {
      const api = projectApi;
      if (!api) {
        setEditFormError(apiUnavailableMessage);
        setUpdating(false);
        return;
      }

      await api.update(editingProject.project_uuid, { 
        project_name: name, 
        description 
      });
      setEditFormValues(initialForm);
      setIsEditDialogOpen(false);
      setEditingProject(null);
      await refreshProjects(api);
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新项目失败';
      setEditFormError(message);
    } finally {
      setUpdating(false);
    }
  }

  function handleNameInput(value: string) {
    setFormValues((prev) => ({
      ...prev,
      name: value.slice(0, NAME_LIMIT)
    }));
  }

  function handleDescriptionInput(value: string) {
    setFormValues((prev) => ({
      ...prev,
      description: value.slice(0, DESCRIPTION_LIMIT)
    }));
  }

  function handleEditNameInput(value: string) {
    setEditFormValues((prev) => ({
      ...prev,
      name: value.slice(0, NAME_LIMIT)
    }));
  }

  function handleEditDescriptionInput(value: string) {
    setEditFormValues((prev) => ({
      ...prev,
      description: value.slice(0, DESCRIPTION_LIMIT)
    }));
  }

  function handlePrevPage() {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  }

  function handleNextPage() {
    if (totalPages === 0) return;
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  }

  useEffect(() => {
    if (!projectApi || !currentWorkspace) {
      setLoading(false);
      setListError(currentWorkspace ? apiUnavailableMessage : 'No workspace selected');
      return;
    }

    refreshProjects(projectApi);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectApi, currentWorkspace]);

  useEffect(() => {
    if (totalPages === 0 && currentPage !== 0) {
      setCurrentPage(0);
      return;
    }

    const lastPageIndex = Math.max(totalPages - 1, 0);
    if (totalPages > 0 && currentPage > lastPageIndex) {
      setCurrentPage(lastPageIndex);
    }
  }, [totalPages, currentPage]);

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
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-indigo-100 shadow-sm">
                <CalendarClock className="h-4 w-4 text-indigo-500" />
                <span className="text-xs uppercase tracking-wide text-slate-600">Project Dashboard</span>
              </div>
              <h1 className="mt-4 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
                Projects
              </h1>
              <p className="text-slate-600 text-sm">Manage your AI-powered projects in "{currentWorkspace.name}"</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200">
                <Plus className="mr-2 h-4 w-4" />
                新建项目
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新项目</DialogTitle>
                <DialogDescription>
                  在 "{currentWorkspace.name}" 工作区中创建一个新的项目。
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleCreateProject}>
                <div className="space-y-2">
                  <label htmlFor="project-name" className="text-sm font-medium text-slate-700">
                    项目名称
                  </label>
                  <div className="relative">
                    <Input
                      id="project-name"
                      value={formValues.name}
                      onChange={(event) => handleNameInput(event.target.value)}
                      placeholder="例如：电商平台重构"
                      maxLength={NAME_LIMIT}
                      className="pr-14"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
                      {formValues.name.length}/30
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="project-description" className="text-sm font-medium text-slate-700">
                    项目描述
                  </label>
                  <div className="relative">
                    <Textarea
                      id="project-description"
                      value={formValues.description}
                      onChange={(event) => handleDescriptionInput(event.target.value)}
                      placeholder="描述项目的目标和功能..."
                      className="min-h-[96px] pr-16"
                      maxLength={DESCRIPTION_LIMIT}
                    />
                    <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-slate-400">
                      {formValues.description.length}/100
                    </span>
                  </div>
                </div>
                {formError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                ) : null}
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                    取消
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
                    disabled={creating}
                  >
                    {creating ? '创建中...' : '创建项目'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* 编辑项目对话框 */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>编辑项目</DialogTitle>
                <DialogDescription>
                  修改项目的名称和描述信息。
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleUpdateProject}>
                <div className="space-y-2">
                  <label htmlFor="edit-project-name" className="text-sm font-medium text-slate-700">
                    项目名称
                  </label>
                  <div className="relative">
                    <Input
                      id="edit-project-name"
                      value={editFormValues.name}
                      onChange={(event) => handleEditNameInput(event.target.value)}
                      placeholder="例如：电商平台重构"
                      maxLength={NAME_LIMIT}
                      className="pr-14"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
                      {editFormValues.name.length}/30
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-project-description" className="text-sm font-medium text-slate-700">
                    项目描述
                  </label>
                  <div className="relative">
                    <Textarea
                      id="edit-project-description"
                      value={editFormValues.description}
                      onChange={(event) => handleEditDescriptionInput(event.target.value)}
                      placeholder="描述项目的目标和功能..."
                      className="min-h-[96px] pr-16"
                      maxLength={DESCRIPTION_LIMIT}
                    />
                    <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-slate-400">
                      {editFormValues.description.length}/100
                    </span>
                  </div>
                </div>
                {editFormError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{editFormError}</AlertDescription>
                  </Alert>
                ) : null}
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>
                    取消
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
                    disabled={updating}
                  >
                    {updating ? '更新中...' : '保存修改'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="text-blue-100 mb-1">Total Projects</div>
            <div className="text-2xl font-semibold text-white">{projects.length}</div>
          </Card>
          <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <div className="text-emerald-100 mb-1">Active</div>
            <div className="text-2xl font-semibold text-white">{projects.filter(p => p.project_name).length}</div>
          </Card>
          <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <div className="text-purple-100 mb-1">Completed</div>
            <div className="text-2xl font-semibold text-white">0</div>
          </Card>
          <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <div className="text-orange-100 mb-1">AI Roles Active</div>
            <div className="text-2xl font-semibold text-white">{projects.length * 3}</div>
          </Card>
        </div>

        {listError ? (
          <Alert variant="destructive" className="border-0 bg-red-50 shadow-lg max-w-xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{listError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex-1 flex flex-col gap-8 pt-8">
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  Your Projects
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrevPage}
                        disabled={currentPage === 0}
                        className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
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
                </CardTitle>
                {totalPages > 1 && (
                  <p className="text-xs text-slate-500 mt-1">
                    第 {currentPage + 1} / {totalPages} 页
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="grid grid-cols-2 gap-6 h-[520px]">
                  {[...Array(PAGE_SIZE)].map((_, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div
                      key={index}
                      className="rounded-3xl border border-slate-200 bg-white/70 p-6 animate-pulse"
                    >
                      <div className="h-5 w-2/3 rounded bg-slate-200" />
                      <div className="mt-4 h-4 w-full rounded bg-slate-100" />
                      <div className="mt-2 h-4 w-3/4 rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : paginatedProjects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-indigo-200 bg-white/70 p-10 text-center space-y-3 h-[240px] flex flex-col justify-center">
                  <h3 className="text-lg font-medium text-slate-900">还没有项目</h3>
                  <p className="text-sm text-slate-600">点击右上角的「新建项目」即可开始。</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6 h-[520px]">
                  {paginatedProjects.map((project) => (
                    <div
                      key={project.project_uuid}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleOpenProject(project)}
                      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleOpenProject(project);
                        }
                      }}
                      className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50/30 to-indigo-50/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 group"
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-sm"></div>
                            <Badge
                              variant="secondary"
                              className="border-0 bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-700 font-medium text-xs px-2 py-1"
                            >
                              Project
                            </Badge>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-indigo-900 transition-colors">
                            {project.project_name.slice(0, 25)}
                            {project.project_name.length > 25 ? '…' : ''}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 h-8 w-8"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOpenSettings(project);
                            }}
                            aria-label="设置项目"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteProject(project.project_uuid);
                            }}
                            aria-label="删除项目"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex-1 mb-4">
                        <p className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
                          {project.description
                            ? project.description.length > 80
                              ? `${project.description.slice(0, 80)}…`
                              : project.description
                            : '暂无描述'}
                        </p>
                      </div>
                      
                      <div className="text-xs text-slate-500 space-y-2 pt-3 border-t border-slate-100/50">
                        <div className="flex items-center gap-2 text-indigo-600 font-medium">
                          <CalendarClock className="h-3 w-3" />
                          <span>创建 {formatDateTime(project.create_time)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-600 font-medium">
                          <Clock className="h-3 w-3" />
                          <span>最近 {formatDateTime(project.last_open_time)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* 占位符 */}
                  {[...Array(placeholderCount)].map((_, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={`placeholder-${index}`} className="invisible" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}