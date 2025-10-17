import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  Users,
  UserCircle2
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
import type { WorkspaceRecord } from '../types/global';

const MAX_WORKSPACES = 5;
const PAGE_SIZE = 6;
const NAME_LIMIT = 10;
const DESCRIPTION_LIMIT = 100;


const WORKSPACE_COLORS = [
  'bg-gradient-to-br from-indigo-50 via-white to-indigo-50/30 ring-1 ring-indigo-100/50 shadow-indigo-100/40',
  'bg-gradient-to-br from-purple-50 via-white to-purple-50/30 ring-1 ring-purple-100/50 shadow-purple-100/40',
  'bg-gradient-to-br from-blue-50 via-white to-blue-50/30 ring-1 ring-blue-100/50 shadow-blue-100/40',
  'bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 ring-1 ring-emerald-100/50 shadow-emerald-100/40',
  'bg-gradient-to-br from-orange-50 via-white to-orange-50/30 ring-1 ring-orange-100/50 shadow-orange-100/40',
  'bg-gradient-to-br from-rose-50 via-white to-rose-50/30 ring-1 ring-rose-100/50 shadow-rose-100/40'
];

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
    return `${year}/${month}/${day}`;
  } catch {
    return value;
  }
}

export function WorkspaceManager() {
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState(initialForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<WorkspaceRecord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormValues, setEditFormValues] = useState(initialForm);
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const workspaceApi =
    typeof window !== 'undefined' ? window.teamiNative?.workspaces : undefined;
  const apiUnavailableMessage = '本地 workspace API 未初始化，请通过桌面客户端访问。';

  const canCreateWorkspace = workspaces.length < MAX_WORKSPACES;

  const latestCreatedAt = useMemo(() => {
    if (!workspaces.length) {
      return null;
    }
    return workspaces.reduce((latest, current) => {
      if (!latest) {
        return current.create_time;
      }
      return new Date(current.create_time) > new Date(latest) ? current.create_time : latest;
    }, workspaces[0]?.create_time ?? null);
  }, [workspaces]);

  const lastVisitedAt = useMemo(() => {
    if (!workspaces.length) {
      return null;
    }
    return workspaces.reduce((latest, current) => {
      if (!latest) {
        return current.last_open_time;
      }
      return new Date(current.last_open_time) > new Date(latest)
        ? current.last_open_time
        : latest;
    }, workspaces[0]?.last_open_time ?? null);
  }, [workspaces]);

  const sortedWorkspaces = useMemo(() => {
    return [...workspaces].sort((a, b) => {
      const aTime = new Date(a.last_open_time || a.create_time).getTime();
      const bTime = new Date(b.last_open_time || b.create_time).getTime();
      return bTime - aTime;
    });
  }, [workspaces]);

  const totalPages =
    sortedWorkspaces.length === 0
      ? 0
      : Math.ceil(sortedWorkspaces.length / PAGE_SIZE);

  const paginatedWorkspaces = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return sortedWorkspaces.slice(start, start + PAGE_SIZE);
  }, [sortedWorkspaces, currentPage]);

  const placeholderCount = Math.max(0, PAGE_SIZE - paginatedWorkspaces.length);

  async function refreshWorkspaces(api = workspaceApi) {
    if (!api) {
      setLoading(false);
      setListError(apiUnavailableMessage);
      return;
    }

    setLoading(true);
    setListError(null);
    try {
      const entries = await api.list();
      setWorkspaces(entries);
    } catch (error) {
      const message = error instanceof Error ? error.message : '无法加载 workspace 列表';
      setListError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenWorkspace(id: number) {
    try {
      const api = workspaceApi;
      if (!api) {
        setListError(apiUnavailableMessage);
        return;
      }

      await api.updateLastOpen(id);
      await refreshWorkspaces(api);
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新 workspace 信息失败';
      setListError(message);
    }
  }

  async function handleCreateWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canCreateWorkspace) {
      setFormError('Workspace 数量已达上限（5 个）');
      return;
    }

    const name = formValues.name.trim();
    const description = formValues.description.trim();

    if (!name) {
      setFormError('名称不能为空');
      return;
    }

    setCreating(true);
    setFormError(null);

    try {
      const api = workspaceApi;
      if (!api) {
        setFormError(apiUnavailableMessage);
        setCreating(false);
        return;
      }

      await api.create({
        name,
        description
      });
      setFormValues(initialForm);
      setIsDialogOpen(false);
      setCurrentPage(0);
      await refreshWorkspaces(api);
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建 workspace 失败';
      setFormError(message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteWorkspace(id: number) {
    const api = workspaceApi;
    if (!api) {
      setListError(apiUnavailableMessage);
      return;
    }

    const confirmed = window.confirm('确认删除该 workspace 吗？此操作不可撤销。');
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(id);
      await refreshWorkspaces(api);
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除 workspace 失败';
      setListError(message);
    }
  }

  function handleOpenSettings(workspace: WorkspaceRecord) {
    setEditingWorkspace(workspace);
    setEditFormValues({
      name: workspace.name,
      description: workspace.description || ''
    });
    setEditFormError(null);
    setIsEditDialogOpen(true);
  }

  async function handleUpdateWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingWorkspace) return;

    const name = editFormValues.name.trim();
    const description = editFormValues.description.trim();

    if (!name) {
      setEditFormError('名称不能为空');
      return;
    }

    setUpdating(true);
    setEditFormError(null);

    try {
      const api = workspaceApi;
      if (!api) {
        setEditFormError(apiUnavailableMessage);
        setUpdating(false);
        return;
      }

      // 更新workspace信息
      await api.update(editingWorkspace.id, { name, description });
      setEditFormValues(initialForm);
      setIsEditDialogOpen(false);
      setEditingWorkspace(null);
      await refreshWorkspaces(api);
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新 workspace 失败';
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
    if (!workspaceApi) {
      setLoading(false);
      setListError(apiUnavailableMessage);
      return;
    }

    refreshWorkspaces(workspaceApi);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceApi]);

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

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 overflow-auto">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-indigo-100 shadow-sm">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <span className="text-xs uppercase tracking-wide text-slate-600">Workspace Hub</span>
            </div>
            <h1 className="mt-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
              Workspaces
            </h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200"
                disabled={!canCreateWorkspace}
              >
                <Plus className="mr-2 h-4 w-4" />
                新建 Workspace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新的 Workspace</DialogTitle>
                <DialogDescription>
                  聚合项目、团队与成员上下文的协作空间，最多支持 5 个。
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleCreateWorkspace}>
                <div className="space-y-2">
                  <label htmlFor="workspace-name" className="text-sm font-medium text-slate-700">
                    名称
                  </label>
                  <div className="relative">
                    <Input
                      id="workspace-name"
                      value={formValues.name}
                      onChange={(event) => handleNameInput(event.target.value)}
                      placeholder="例如：亚太交付团队"
                      maxLength={NAME_LIMIT}
                      className="pr-14"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
                      {formValues.name.length}/10
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="workspace-description" className="text-sm font-medium text-slate-700">
                    描述
                  </label>
                  <div className="relative">
                    <Textarea
                      id="workspace-description"
                      value={formValues.description}
                      onChange={(event) => handleDescriptionInput(event.target.value)}
                      placeholder="补充背景信息，帮助团队快速了解该 workspace。"
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
                    {creating ? '创建中...' : '创建 Workspace'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* 编辑 Workspace 对话框 */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>编辑 Workspace</DialogTitle>
                <DialogDescription>
                  修改工作空间的名称和描述信息。
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleUpdateWorkspace}>
                <div className="space-y-2">
                  <label htmlFor="edit-workspace-name" className="text-sm font-medium text-slate-700">
                    名称
                  </label>
                  <div className="relative">
                    <Input
                      id="edit-workspace-name"
                      value={editFormValues.name}
                      onChange={(event) => handleEditNameInput(event.target.value)}
                      placeholder="例如：亚太交付团队"
                      maxLength={NAME_LIMIT}
                      className="pr-14"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
                      {editFormValues.name.length}/10
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-workspace-description" className="text-sm font-medium text-slate-700">
                    描述
                  </label>
                  <div className="relative">
                    <Textarea
                      id="edit-workspace-description"
                      value={editFormValues.description}
                      onChange={(event) => handleEditDescriptionInput(event.target.value)}
                      placeholder="补充背景信息，帮助团队快速了解该 workspace。"
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

        <div className="overflow-x-auto">
          <div className="grid grid-cols-3 gap-4 min-w-max">
            <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white min-w-[220px]">
              <div className="text-blue-100 mb-1">总数</div>
              <div className="text-2xl font-semibold">{workspaces.length}</div>
            </Card>
            <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white min-w-[220px]">
              <div className="text-purple-100 mb-1">最新创建</div>
              <div className="text-sm">
                {latestCreatedAt ? formatDateTime(latestCreatedAt) : '尚未创建'}
              </div>
            </Card>
            <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white min-w-[220px]">
              <div className="text-orange-100 mb-1">最近访问</div>
              <div className="text-sm">
                {lastVisitedAt ? formatDateTime(lastVisitedAt) : '暂无记录'}
              </div>
            </Card>
          </div>
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
                <CardTitle className="text-slate-900">Workspace 列表</CardTitle>
                {totalPages > 1 && (
                  <p className="text-xs text-slate-500 mt-1">
                    第 {currentPage + 1} / {totalPages} 页
                  </p>
                )}
              </div>
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
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="flex flex-wrap gap-6 h-[520px]">
                  {[...Array(PAGE_SIZE)].map((_, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div
                      key={index}
                      className="w-[calc(33.333%-16px)] min-w-[280px] h-[240px] rounded-3xl border border-slate-200 bg-white/70 p-6 animate-pulse"
                    >
                      <div className="h-5 w-2/3 rounded bg-slate-200" />
                      <div className="mt-4 h-4 w-full rounded bg-slate-100" />
                      <div className="mt-2 h-4 w-3/4 rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : paginatedWorkspaces.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-indigo-200 bg-white/70 p-10 text-center space-y-3 h-[240px] flex flex-col justify-center">
                  <h3 className="text-lg font-medium text-slate-900">还没有 workspace</h3>
                  <p className="text-sm text-slate-600">点击右上角的「新建 Workspace」即可开始。</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-6 h-[520px]">
                  {paginatedWorkspaces.map((workspace, index) => {
                    const colorClass = WORKSPACE_COLORS[workspace.id % WORKSPACE_COLORS.length];
                    
                    return (
                      <div
                        key={workspace.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleOpenWorkspace(workspace.id)}
                        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleOpenWorkspace(workspace.id);
                          }
                        }}
                        className="w-[calc(33.333%-16px)] min-w-[280px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-3xl"
                      >
                        <div className={`h-[240px] rounded-xl border-0 ${colorClass} shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6 flex flex-col group`}>
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-sm"></div>
                                <Badge
                                  variant="secondary"
                                  className="border-0 bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-700 font-medium text-xs px-2 py-1"
                                >
                                  Workspace
                                </Badge>
                              </div>
                              <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-indigo-900 transition-colors">
                                {workspace.name.slice(0, 12)}
                                {workspace.name.length > 12 ? '…' : ''}
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
                                  handleOpenSettings(workspace);
                                }}
                                aria-label="设置 workspace"
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
                                  handleDeleteWorkspace(workspace.id);
                                }}
                                aria-label="删除 workspace"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex-1 mb-4">
                            <p className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
                              {workspace.description
                                ? workspace.description.length > 80
                                  ? `${workspace.description.slice(0, 80)}…`
                                  : workspace.description
                                : '暂无描述'}
                            </p>
                          </div>
                          
                          <div className="text-xs text-slate-500 space-y-2 pt-3 border-t border-slate-100/50">
                            <div className="flex items-center gap-2 text-indigo-600 font-medium">
                              <CalendarClock className="h-3 w-3" />
                              <span>创建 {formatDateTime(workspace.create_time)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-purple-600 font-medium">
                              <Clock className="h-3 w-3" />
                              <span>访问 {formatDateTime(workspace.last_open_time)}</span>
                            </div>
                          </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 mt-12">
          <CardHeader>
            <CardTitle className="text-slate-900 text-base">连接 Teams 与 Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-indigo-500" />
              <p>在 Teams 选项卡中配置协作小组，让跨角色配合更顺畅。</p>
            </div>
            <div className="flex items-start gap-3">
              <UserCircle2 className="h-5 w-5 text-purple-500" />
              <p>Members 选项卡将用于邀请成员、分配 AI 角色与权限。</p>
            </div>
            <p className="text-xs text-slate-500">
              当前版本聚焦 workspace 初始化，后续版本会提供更完善的团队协作功能。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
