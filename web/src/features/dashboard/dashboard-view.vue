<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { Activity, Clock, Edit3, Plus, Trash2 } from 'lucide-vue-next';
import { listProjects, deleteProject, updateProject } from '@/api/projects';
import type { ProjectRead, ProjectUpdateRequest } from '@/api/projects.types';

const props = defineProps<{
  workspaceId?: string | null;
  workspaceName?: string | null;
  viewMode?: 'dashboard' | 'projects';
  refreshKey?: number;
}>();

const emit = defineEmits<{
  (e: 'create-project'): void;
  (e: 'open-project', id: string): void;
}>();

const projects = ref<ProjectRead[]>([]);
const isLoading = ref(false);
const loadError = ref<string | null>(null);
const pagination = reactive({
  page: 1,
  pageSize: 8,
  total: 0
});

const deletingProject = ref<ProjectRead | null>(null);
const deleteError = ref<string | null>(null);
const isDeleting = ref(false);

const editingProject = ref<ProjectRead | null>(null);
const editForm = reactive({
  name: '',
  description: '',
  labels: ''
});
const editError = ref<string | null>(null);
const isSavingEdit = ref(false);

const viewMode = computed(() => props.viewMode ?? 'dashboard');

const derivedPageSize = computed(() => (viewMode.value === 'dashboard' ? 6 : 8));

const totalProjects = computed(() => pagination.total);
const activeProjects = computed(() =>
  projects.value.filter((project) => Boolean(project.last_open_time)).length
);
const recentProjects = computed(() =>
  [...projects.value]
    .filter((project) => project.last_open_time)
    .sort((a, b) =>
      new Date(b.last_open_time ?? 0).getTime() - new Date(a.last_open_time ?? 0).getTime()
    )
    .slice(0, 5)
);

const hasNextPage = computed(
  () => pagination.page * pagination.pageSize < pagination.total
);
const hasPrevPage = computed(() => pagination.page > 1);

const title = computed(() => {
  if (viewMode.value === 'projects') {
    return props.workspaceName ? `${props.workspaceName} • Projects` : 'Projects';
  }
  return props.workspaceName ? `${props.workspaceName} Dashboard` : 'Workspace Dashboard';
});

const subtitle = computed(() => {
  if (viewMode.value === 'projects') {
    return props.workspaceName
      ? `Manage projects and AI teams within ${props.workspaceName}`
      : 'Manage your AI-powered projects and teams';
  }
  return props.workspaceName
    ? `Overview of activity, progress, and collaboration for ${props.workspaceName}`
    : 'Get a quick overview of your AI collaboration workstreams';
});

const showMetrics = computed(() => viewMode.value === 'dashboard');

const visibleProjects = computed(() =>
  viewMode.value === 'dashboard' ? projects.value.slice(0, 4) : projects.value
);

const statsCards = computed(() => [
  {
    id: 'total',
    label: 'Total Projects',
    value: totalProjects.value.toString(),
    className: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
  },
  {
    id: 'active',
    label: 'Recently Active',
    value: activeProjects.value.toString(),
    className: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
  },
  {
    id: 'recent',
    label: 'Updated This Week',
    value: recentProjects.value.length.toString(),
    className: 'bg-gradient-to-br from-purple-500 to-pink-600 text-white'
  },
  {
    id: 'page',
    label: 'Page Size',
    value: pagination.pageSize.toString(),
    className: 'bg-gradient-to-br from-orange-500 to-red-600 text-white'
  }
]);

const formatRelativeTime = (timestamp: string | null) => {
  if (!timestamp) return '暂无动态';
  const date = new Date(timestamp);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} 天前`;
  return date.toLocaleString();
};

const formatDate = (timestamp: string) => new Date(timestamp).toLocaleString();

const loadProjects = async (page = pagination.page) => {
  if (!props.workspaceId) {
    projects.value = [];
    pagination.page = 1;
    pagination.total = 0;
    return;
  }

  isLoading.value = true;
  loadError.value = null;

  try {
    const result = await listProjects({
      workspaceUuid: props.workspaceId,
      page,
      page_size: derivedPageSize.value
    });
    projects.value = result.projects;
    pagination.page = result.page;
    pagination.pageSize = result.page_size;
    pagination.total = result.total;
    if (!result.projects.length && result.page > 1) {
      await loadProjects(result.page - 1);
    }
  } catch (error) {
    console.error('Failed to load projects', error);
    loadError.value =
      error instanceof Error ? error.message : '无法加载项目列表，请稍后再试。';
    projects.value = [];
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => [props.workspaceId, viewMode.value, props.refreshKey],
  () => {
    pagination.page = 1;
    pagination.pageSize = derivedPageSize.value;
    void loadProjects(1);
  },
  { immediate: true }
);

const handleCreateProject = () => emit('create-project');

const handleOpenProject = (id: string) => emit('open-project', id);

const goToNextPage = () => {
  if (hasNextPage.value) {
    void loadProjects(pagination.page + 1);
  }
};

const goToPrevPage = () => {
  if (hasPrevPage.value) {
    void loadProjects(pagination.page - 1);
  }
};

const confirmDeleteProject = (project: ProjectRead) => {
  deletingProject.value = project;
  deleteError.value = null;
};

const cancelDeleteProject = () => {
  deletingProject.value = null;
  deleteError.value = null;
};

const performDeleteProject = async () => {
  if (!deletingProject.value) return;
  isDeleting.value = true;
  deleteError.value = null;
  try {
    await deleteProject(deletingProject.value.uuid);
    deletingProject.value = null;
    await loadProjects(pagination.page);
  } catch (error) {
    console.error('Failed to delete project', error);
    deleteError.value =
      error instanceof Error ? error.message : '删除项目失败，请稍后再试。';
  } finally {
    isDeleting.value = false;
  }
};

const openEditProject = (project: ProjectRead) => {
  editingProject.value = project;
  editForm.name = project.name;
  editForm.description = project.description ?? '';
  editForm.labels = project.labels.join(', ');
  editError.value = null;
};

const cancelEditProject = () => {
  editingProject.value = null;
  editError.value = null;
};

const saveProjectChanges = async () => {
  if (!editingProject.value) return;
  const payload: ProjectUpdateRequest = {
    name: editForm.name.trim() || undefined,
    description: editForm.description.trim() || null,
    labels: editForm.labels
      .split(',')
      .map((label) => label.trim())
      .filter(Boolean)
  };

  isSavingEdit.value = true;
  editError.value = null;

  try {
    await updateProject(editingProject.value.uuid, payload);
    editingProject.value = null;
    await loadProjects(pagination.page);
  } catch (error) {
    console.error('Failed to update project', error);
    editError.value =
      error instanceof Error ? error.message : '更新项目失败，请稍后再试。';
  } finally {
    isSavingEdit.value = false;
  }
};
</script>

<template>
  <section class="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
    <div class="mx-auto max-w-7xl p-8">
      <header class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {{ title }}
          </h1>
          <p class="text-slate-600">{{ subtitle }}</p>
        </div>
        <button
          type="button"
          class="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-700 hover:to-purple-700"
          @click="handleCreateProject"
        >
          <Plus class="mr-2 h-4 w-4" />
          Create New Project
        </button>
      </header>

      <div
        v-if="showMetrics"
        class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4"
      >
        <article
          v-for="stat in statsCards"
          :key="stat.id"
          class="rounded-2xl p-5 text-sm shadow-lg"
          :class="stat.className"
        >
          <div class="mb-1 opacity-80">{{ stat.label }}</div>
          <div class="text-2xl font-semibold text-white">{{ stat.value }}</div>
        </article>
      </div>

      <div v-if="loadError" class="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
        {{ loadError }}
      </div>

      <div class="mb-8">
        <h2 class="mb-4 text-slate-900">Your Projects</h2>
        <div
          v-if="isLoading && !projects.length"
          class="rounded-3xl border border-dashed border-purple-200 bg-white/70 p-8 text-center text-slate-500"
        >
          正在加载项目...
        </div>
        <div
          v-else-if="!isLoading && !visibleProjects.length"
          class="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-purple-200 bg-white/70 text-center text-slate-500"
        >
          <div class="max-w-xl px-8">
            <p class="text-lg font-medium">No projects yet.</p>
            <p class="mt-2 text-sm">点击右上角按钮创建一个吧。</p>
          </div>
        </div>
        <div
          v-else
          class="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          <article
            v-for="project in visibleProjects"
            :key="project.uuid"
            class="group relative cursor-pointer rounded-3xl border-0 bg-white p-6 shadow-lg transition duration-300 hover:scale-[1.02] hover:shadow-2xl"
            @click="handleOpenProject(project.uuid)"
          >

            <div class="mb-4 flex items-start justify-between">
              <div class="flex-1 pr-4">
                <h3 class="mb-1 text-lg font-semibold text-slate-900">{{ project.name }}</h3>
                <p class="text-sm text-slate-600">
                  {{ project.description || '暂无描述' }}
                </p>
              </div>
              <span class="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span class="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Ready
              </span>
            </div>

            <div
              v-if="project.labels.length"
              class="mb-4 flex flex-wrap gap-2"
            >
              <span
                v-for="label in project.labels"
                :key="label"
                class="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
              >
                {{ label }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-6 text-sm text-slate-600">
                <span class="inline-flex items-center gap-2">
                  <Activity class="h-4 w-4 text-emerald-500" />
                  创建于 {{ formatDate(project.create_time) }}
                </span>
                <span class="inline-flex items-center gap-2">
                  <Clock class="h-4 w-4 text-indigo-500" />
                  {{ formatRelativeTime(project.last_open_time) }}
                </span>
              </div>
              <div class="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  class="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-purple-300 hover:text-purple-600"
                  @click.stop="openEditProject(project)"
                >
                  <Edit3 class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-rose-300 hover:text-rose-600"
                  @click.stop="confirmDeleteProject(project)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div v-if="recentProjects.length" class="mb-8">
        <h2 class="mb-4 text-slate-900">Recent Activity</h2>
        <article class="rounded-3xl border-0 bg-gradient-to-br from-white to-indigo-50/30 p-6 shadow-lg">
          <div class="space-y-4">
            <div
              v-for="project in recentProjects"
              :key="project.uuid"
              class="flex items-start gap-4 border-b border-indigo-100 pb-4 last:border-0 last:pb-0"
            >
              <div class="mt-2 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg" />
              <div class="flex-1">
                <div class="text-sm font-semibold text-slate-900">{{ project.name }}</div>
                <div class="text-sm text-slate-600">
                  最近访问于 {{ formatRelativeTime(project.last_open_time) }}
                </div>
              </div>
              <div class="text-xs text-slate-500">{{ formatDate(project.create_time) }}</div>
            </div>
          </div>
        </article>
      </div>

      <div class="sticky bottom-0 mt-8 bg-gradient-to-br from-slate-50/60 via-indigo-50/60 to-purple-50/60 backdrop-blur">
        <div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-lg">
          <div>
            Page {{ pagination.page }} · Showing
            {{ projects.length }} of {{ pagination.total }} projects
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-xl border border-slate-200 px-3 py-2 text-sm transition hover:border-purple-300 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!hasPrevPage || isLoading"
              @click="goToPrevPage"
            >
              Previous
            </button>
            <button
              type="button"
              class="rounded-xl border border-slate-200 px-3 py-2 text-sm transition hover:border-purple-300 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!hasNextPage || isLoading"
              @click="goToNextPage"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <teleport to="body">
    <Transition name="fade">
      <div
        v-if="deletingProject"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
      >
        <div class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
          <h2 class="text-lg font-semibold text-slate-900">删除项目</h2>
          <p class="mt-3 text-sm text-slate-600">
            确定要删除项目 “{{ deletingProject.name }}” 吗？该操作不可恢复。
          </p>
          <p
            v-if="deleteError"
            class="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700"
          >
            {{ deleteError }}
          </p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-purple-300"
              @click="cancelDeleteProject"
            >
              取消
            </button>
            <button
              type="button"
              class="rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-rose-600 hover:to-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isDeleting"
              @click="performDeleteProject"
            >
              {{ isDeleting ? '删除中...' : '确认删除' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </teleport>

  <teleport to="body">
    <Transition name="fade">
      <div
        v-if="editingProject"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
      >
        <div class="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
          <h2 class="text-lg font-semibold text-slate-900">编辑项目</h2>
          <div class="mt-4 space-y-4">
            <div>
              <label class="text-sm font-medium text-slate-700" for="edit-name">名称</label>
              <input
                id="edit-name"
                v-model="editForm.name"
                type="text"
                class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700" for="edit-description">描述</label>
              <textarea
                id="edit-description"
                v-model="editForm.description"
                class="mt-2 w-full min-h-[6rem] rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700" for="edit-labels">标签（用逗号分隔）</label>
              <input
                id="edit-labels"
                v-model="editForm.labels"
                type="text"
                class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
          <p
            v-if="editError"
            class="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700"
          >
            {{ editError }}
          </p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-purple-300"
              @click="cancelEditProject"
            >
              取消
            </button>
            <button
              type="button"
              class="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isSavingEdit"
              @click="saveProjectChanges"
            >
              {{ isSavingEdit ? '保存中...' : '保存修改' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
