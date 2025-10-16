<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import { Plus, CalendarDays, PenSquare } from 'lucide-vue-next';
import { createWorkspace, listWorkspaces } from '@/api/workspaces';
import type { WorkspaceRead } from '@/api/workspaces.types';

const emit = defineEmits<{
  (e: 'open-workspace', workspace: WorkspaceRead): void;
}>();

const workspaces = ref<WorkspaceRead[]>([]);
const isLoading = ref(false);
const loadError = ref<string | null>(null);
const showCreatePanel = ref(false);
const isSubmitting = ref(false);
const createError = ref<string | null>(null);
const createErrorDialog = ref<string | null>(null);

const pagination = reactive({
  page: 1,
  pageSize: 8,
  total: 0
});

const formState = reactive({
  name: '',
  description: ''
});

const workspaceCount = computed(() => pagination.total);

const hasNextPage = computed(
  () => pagination.page * pagination.pageSize < pagination.total
);
const hasPrevPage = computed(() => pagination.page > 1);

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const resetForm = () => {
  formState.name = '';
  formState.description = '';
  createError.value = null;
};

const handleCreateClick = () => {
  showCreatePanel.value = true;
  resetForm();
};

const handleCancel = () => {
  showCreatePanel.value = false;
  resetForm();
};

const loadWorkspaces = async (page = pagination.page) => {
  isLoading.value = true;
  loadError.value = null;

  try {
    const result = await listWorkspaces({
      page,
      page_size: pagination.pageSize
    });
    workspaces.value = result.items;
    pagination.page = result.page;
    pagination.pageSize = result.page_size;
    pagination.total = result.total;
    if (!result.items.length && result.page > 1) {
      await loadWorkspaces(result.page - 1);
    }
  } catch (error) {
    console.error('Failed to load workspaces', error);
    loadError.value =
      error instanceof Error ? error.message : 'Unable to load workspaces. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  const name = formState.name.trim();
  const description = formState.description.trim();

  if (!name) {
    createError.value = 'Workspace name is required.';
    return;
  }

  isSubmitting.value = true;
  createError.value = null;

  try {
    await createWorkspace({
      name,
      description: description.length ? description : null
    });

    showCreatePanel.value = false;
    resetForm();
    await loadWorkspaces(1);
  } catch (error) {
    console.error('Failed to create workspace', error);
    const message =
      error instanceof Error ? error.message : 'Unable to create workspace. Please try again.';
    createError.value = message;
    createErrorDialog.value = message;
  } finally {
    isSubmitting.value = false;
  }
};

const handleOpenWorkspace = (workspace: WorkspaceRead) => {
  emit('open-workspace', workspace);
};

const goToNextPage = () => {
  if (hasNextPage.value) {
    void loadWorkspaces(pagination.page + 1);
  }
};

const goToPrevPage = () => {
  if (hasPrevPage.value) {
    void loadWorkspaces(pagination.page - 1);
  }
};

onMounted(() => {
  void loadWorkspaces(1);
});

const closeCreateErrorDialog = () => {
  createErrorDialog.value = null;
};
</script>

<template>
  <section class="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
    <div class="mx-auto max-w-6xl p-8">
      <header class="mb-8 flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-indigo-600/90 to-purple-600/80 p-8 text-white shadow-xl">
        <div>
          <p class="text-sm uppercase tracking-[0.2em] text-indigo-100">Workspace Hub</p>
          <h1 class="mt-2 text-3xl font-semibold">Workspace Management</h1>
          <p class="mt-2 max-w-2xl text-indigo-100/90">
            Organise collaboration spaces for different product initiatives. Create a new workspace to group projects and AI teams around a shared goal.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-4">
          <div class="rounded-2xl border border-white/25 bg-white/10 px-6 py-4 backdrop-blur-sm">
            <div class="text-xs uppercase tracking-wide text-indigo-100/80">Total Workspaces</div>
            <div class="text-2xl font-semibold">{{ workspaceCount }}</div>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-glow transition hover:-translate-y-0.5 hover:bg-indigo-50"
            @click="handleCreateClick"
          >
            <Plus class="h-4 w-4" />
            Create Workspace
          </button>
        </div>
      </header>

      <div
        v-if="loadError"
        class="mb-6 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700"
      >
        {{ loadError }}
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <article
          v-if="showCreatePanel"
          class="rounded-3xl border border-indigo-200/60 bg-white p-6 shadow-lg"
        >
          <h2 class="text-lg font-semibold text-slate-900">New Workspace</h2>
          <p class="mt-1 text-sm text-slate-600">Set up a workspace with a clear name and description.</p>

          <div class="mt-6 space-y-4">
            <div>
              <label class="text-sm font-medium text-slate-700" for="workspace-name">Name</label>
              <input
                id="workspace-name"
                v-model="formState.name"
                type="text"
                placeholder="e.g., Growth Experiments"
                class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700" for="workspace-description">Description</label>
              <textarea
                id="workspace-description"
                v-model="formState.description"
                placeholder="Describe the mission, team focus, or responsibilities for this workspace..."
                class="mt-2 w-full min-h-[8rem] rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          <div class="mt-6 flex gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isSubmitting || !formState.name.trim()"
              @click="handleSubmit"
            >
              <PenSquare class="h-4 w-4" />
              <span v-if="!isSubmitting">Save Workspace</span>
              <span v-else>Saving...</span>
            </button>
            <button
              type="button"
              class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-purple-300"
              @click="handleCancel"
            >
              Cancel
            </button>
          </div>

          <p
            v-if="createError"
            class="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700"
          >
            {{ createError }}
          </p>
        </article>

        <article
          v-if="isLoading && !workspaces.length"
          class="flex flex-col justify-between rounded-3xl border-0 bg-white p-6 shadow-lg"
        >
          <div class="flex flex-1 flex-col items-center justify-center text-center text-slate-500">
            Loading workspaces...
          </div>
        </article>

        <template v-else-if="!isLoading && !workspaces.length && !showCreatePanel">
          <div class="col-span-full">
            <div class="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-purple-200 bg-white/70 text-center text-slate-500">
              <div class="max-w-xl px-8">
                <p class="text-lg font-medium">No workspaces found yet.</p>
                <p class="mt-2 text-sm">Create one to get started.</p>
              </div>
            </div>
          </div>
        </template>

        <article
          v-for="workspace in workspaces"
          :key="workspace.uuid"
          class="flex flex-col justify-between rounded-3xl border-0 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          role="button"
          tabindex="0"
          @click="handleOpenWorkspace(workspace)"
          @keyup.enter="handleOpenWorkspace(workspace)"
          @keyup.space.prevent="handleOpenWorkspace(workspace)"
        >
          <div>
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="text-xl font-semibold text-slate-900">{{ workspace.name }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-slate-600">
                  {{ workspace.description || 'No description provided.' }}
                </p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <div class="inline-flex items-center gap-2">
              <CalendarDays class="h-4 w-4 text-indigo-500" />
              <span class="font-medium text-slate-700">Created</span>
            </div>
            <span class="text-slate-500">{{ formatDate(workspace.create_time) }}</span>
          </div>
        </article>
      </div>

      <div class="sticky bottom-0 mt-8 bg-gradient-to-br from-slate-50/60 via-indigo-50/60 to-purple-50/60 backdrop-blur">
        <div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-lg">
          <div>
            Page {{ pagination.page }} · Showing
            {{ workspaces.length }} of {{ pagination.total }} workspaces
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
        v-if="createErrorDialog"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
      >
        <div class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
          <h2 class="text-lg font-semibold text-slate-900">创建 Workspace 失败</h2>
          <p class="mt-3 text-sm text-slate-600">
            {{ createErrorDialog }}
          </p>
          <div class="mt-6 flex justify-end">
            <button
              type="button"
              class="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-700 hover:to-purple-700"
              @click="closeCreateErrorDialog"
            >
              我知道了
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
