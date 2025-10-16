<script setup lang="ts">
import { ref } from 'vue';
import type { WorkspaceRead } from '@/api/workspaces.types';
import Sidebar from '@/components/sidebar.vue';
import RoleSetupModal from '@/components/role-setup-modal.vue';
import DashboardView from '@/features/dashboard/dashboard-view.vue';
import ProjectCreationFlow from '@/features/projects/project-creation-flow.vue';
import AiRolesConfig from '@/features/roles/ai-roles-config.vue';
import ProjectWorkspace from '@/features/workspace/project-workspace.vue';
import WorkspaceManagement from '@/features/workspace/workspace-management.vue';
import AiMembersView from '@/features/members/ai-members.vue';

type ViewType =
  | 'workspace-management'
  | 'dashboard'
  | 'projects'
  | 'create-project'
  | 'ai-roles'
  | 'workspace'
  | 'ai-members'
  | 'team'
  | 'settings';

type WorkspaceSummary = WorkspaceRead;

const currentView = ref<ViewType>('workspace-management');
const isRoleModalOpen = ref(false);
const editingRoleId = ref<string | null>(null);
const selectedWorkspace = ref<WorkspaceSummary | null>(null);
const projectRefreshKey = ref(0);

const handleNavigate = (view: ViewType) => {
  if (view === 'workspace-management') {
    selectedWorkspace.value = null;
  }

  if ((view === 'dashboard' || view === 'projects') && !selectedWorkspace.value) {
    currentView.value = 'workspace-management';
    return;
  }

  currentView.value = view;
};

const handleWorkspaceOpened = (workspace: WorkspaceSummary) => {
  selectedWorkspace.value = workspace;
  currentView.value = 'dashboard';
};

const handleCreateProject = () => {
  if (!selectedWorkspace.value) {
    currentView.value = 'workspace-management';
    return;
  }
  currentView.value = 'create-project';
};

const handleProjectCreated = () => {
  projectRefreshKey.value += 1;
  currentView.value = 'projects';
};

const handleOpenProject = () => {
  currentView.value = 'workspace';
};

const handleBackToWorkspaceDashboard = () => {
  if (!selectedWorkspace.value) {
    currentView.value = 'workspace-management';
    return;
  }
  currentView.value = 'dashboard';
};

const handleConfigureRoles = () => {
  currentView.value = 'ai-roles';
};

const handleAddRole = () => {
  editingRoleId.value = null;
  isRoleModalOpen.value = true;
};

const handleEditRole = (roleId: string) => {
  editingRoleId.value = roleId;
  isRoleModalOpen.value = true;
};

const handleSaveRole = () => {
  isRoleModalOpen.value = false;
};

const handleBrandClick = () => {
  selectedWorkspace.value = null;
  currentView.value = 'workspace-management';
};
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-white">
    <Sidebar
      v-if="currentView !== 'workspace'"
      :current-view="currentView"
      :workspace-selected="!!selectedWorkspace"
      @navigate="handleNavigate"
      @brand-click="handleBrandClick"
    />

    <WorkspaceManagement
      v-if="currentView === 'workspace-management'"
      @open-workspace="handleWorkspaceOpened"
    />

    <DashboardView
      v-else-if="currentView === 'dashboard' || currentView === 'projects'"
      :workspace-id="selectedWorkspace?.uuid ?? null"
      :workspace-name="selectedWorkspace?.name"
      :view-mode="currentView === 'projects' ? 'projects' : 'dashboard'"
      :refresh-key="projectRefreshKey"
      @create-project="handleCreateProject"
      @open-project="handleOpenProject"
    />

    <ProjectCreationFlow
      v-else-if="currentView === 'create-project'"
      :workspace-id="selectedWorkspace?.uuid ?? null"
      :workspace-name="selectedWorkspace?.name"
      @back="handleBackToWorkspaceDashboard"
      @complete="handleProjectCreated"
    />

    <AiRolesConfig
      v-else-if="currentView === 'ai-roles'"
      :workspace-name="selectedWorkspace?.name"
      @back="handleBackToWorkspaceDashboard"
      @add-role="handleAddRole"
      @edit-role="handleEditRole"
    />

    <ProjectWorkspace
      v-else-if="currentView === 'workspace'"
      :workspace-name="selectedWorkspace?.name"
      @back="handleBackToWorkspaceDashboard"
      @configure-roles="handleConfigureRoles"
    />

    <AiMembersView
      v-else-if="currentView === 'ai-members'"
      :workspace-name="selectedWorkspace?.name"
    />

    <div
      v-else
      class="flex-1 bg-white p-8"
    >
      <h1 class="mb-4 text-slate-900">
        {{ currentView === 'team' ? 'Team Management' : 'Settings' }}
      </h1>
      <p class="text-slate-600">
        {{ currentView === 'team'
          ? 'Manage your team members and permissions'
          : 'Configure your account and preferences'
        }}
      </p>
    </div>
  </div>

  <RoleSetupModal
    :is-open="isRoleModalOpen"
    :role-id="editingRoleId ?? undefined"
    @close="isRoleModalOpen = false"
    @save="handleSaveRole"
  />
</template>
