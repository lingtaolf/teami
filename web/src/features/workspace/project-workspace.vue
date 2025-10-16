<script setup lang="ts">
import { computed, ref } from 'vue';
import { Send, FileText, Code, Image, CheckCircle, Clock, ArrowLeft, Settings, MoreVertical } from 'lucide-vue-next';
import { getRoleStatusStyle, getTaskStatusStyle, getTaskStatusDotStyle, type RoleStatus, type TaskStatus } from '@/utils/status-styles';

const props = defineProps<{
  workspaceName?: string | null;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'configure-roles'): void;
}>();


interface ActiveRole {
  id: string;
  name: string;
  status: RoleStatus;
  model: string;
  lastActive: string;
}

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  timestamp: string;
}

interface GeneratedFile {
  id: string;
  name: string;
  type: 'document' | 'code' | 'design';
  size: string;
  author: string;
  date: string;
}

interface TaskItem {
  id: string;
  title: string;
  status: TaskStatus;
  assignee: string;
}

const activeRoles: ActiveRole[] = [
  { id: '1', name: 'Product Manager', status: 'active', model: 'GPT-4', lastActive: '2m ago' },
  { id: '2', name: 'Architect', status: 'active', model: 'Claude-3', lastActive: '5m ago' },
  { id: '3', name: 'Frontend Dev', status: 'idle', model: 'GPT-4', lastActive: '15m ago' },
  { id: '4', name: 'UI Designer', status: 'working', model: 'Figma AI', lastActive: '1m ago' },
  { id: '5', name: 'QA Tester', status: 'idle', model: 'Claude-3', lastActive: '10m ago' }
];

const chatMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'I need to create a user authentication flow for the e-commerce platform',
    timestamp: '10:30 AM'
  },
  {
    id: '2',
    role: 'Product Manager',
    content:
      'I\'ve analyzed the requirements. Here\'s what we need:\n\n1. User Registration (email/password)\n2. Email verification\n3. Login with "Remember Me" option\n4. Password reset flow\n5. OAuth integration (Google, GitHub)\n\nShould we prioritize the OAuth integration for v1?',
    timestamp: '10:31 AM'
  },
  {
    id: '3',
    role: 'Architect',
    content:
      'For the authentication architecture, I recommend:\n\n- JWT tokens with refresh token rotation\n- Redis for session management\n- Separate auth microservice\n- Rate limiting on login endpoints\n\nI\'ll create a detailed architecture diagram.',
    timestamp: '10:33 AM'
  },
  {
    id: '4',
    role: 'user',
    content: 'Yes, include OAuth. Can the UI Designer create mockups for the login page?',
    timestamp: '10:35 AM'
  },
  {
    id: '5',
    role: 'UI Designer',
    content:
      "I've created a modern login page design with:\n\n- Clean, minimal interface\n- Social login buttons prominently displayed\n- Password strength indicator\n- Mobile-responsive layout\n\nCheck the Files section for the Figma mockups.",
    timestamp: '10:37 AM'
  }
];

const generatedFiles: GeneratedFile[] = [
  { id: '1', name: 'auth-architecture.md', type: 'document', size: '12 KB', author: 'Architect', date: '10:33 AM' },
  { id: '2', name: 'user-stories.md', type: 'document', size: '8 KB', author: 'Product Manager', date: '10:31 AM' },
  { id: '3', name: 'login-page-mockup.fig', type: 'design', size: '245 KB', author: 'UI Designer', date: '10:37 AM' },
  { id: '4', name: 'auth.service.ts', type: 'code', size: '15 KB', author: 'Frontend Dev', date: '10:40 AM' },
  { id: '5', name: 'test-cases.md', type: 'document', size: '6 KB', author: 'QA Tester', date: '10:42 AM' }
];

const tasks: TaskItem[] = [
  { id: '1', title: 'Create authentication architecture', status: 'completed', assignee: 'Architect' },
  { id: '2', title: 'Design login page UI', status: 'completed', assignee: 'UI Designer' },
  { id: '3', title: 'Implement auth service', status: 'in-progress', assignee: 'Frontend Dev' },
  { id: '4', title: 'Write test cases', status: 'in-progress', assignee: 'QA Tester' },
  { id: '5', title: 'Setup OAuth providers', status: 'pending', assignee: 'Architect' }
];


const activeTab = ref<'chat' | 'tasks' | 'files'>('chat');
const taskInput = ref('');

const fileIconConfig = {
  code: { component: Code, className: 'text-blue-600' },
  design: { component: Image, className: 'text-purple-600' },
  document: { component: FileText, className: 'text-slate-600' }
} as const;

const setTab = (tab: 'chat' | 'tasks' | 'files') => {
  activeTab.value = tab;
};

const tabButtonClass = (tab: 'chat' | 'tasks' | 'files') => {
  const isActive = activeTab.value === tab;
  return [
    'rounded-xl px-4 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
      : 'bg-white text-slate-600 hover:bg-slate-100'
  ];
};

const handleSubmit = () => {
  taskInput.value = '';
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSubmit();
  }
};

const workspaceTitle = computed(() => props.workspaceName ?? 'Workspace');
const workspaceHeading = computed(() =>
  props.workspaceName ? `${props.workspaceName} Workspace` : 'Project Workspace'
);
</script>

<template>
  <section class="flex-1 bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20">
    <div class="flex h-screen">
      <aside class="flex w-72 flex-col border-r border-purple-200 bg-gradient-to-b from-white to-indigo-50/30">
        <div class="border-b border-purple-200 p-4">
          <button
            type="button"
            class="mb-3 flex w-full items-center justify-start rounded-xl px-4 py-2 text-sm text-slate-700 transition hover:bg-white/60"
            @click="emit('back')"
          >
            <ArrowLeft class="mr-2 h-4 w-4" />
            Back to Projects
          </button>
          <h2 class="text-lg font-semibold text-slate-900">{{ workspaceTitle }}</h2>
          <p class="text-sm text-slate-600">Active AI Team</p>
        </div>

        <div class="flex-1 overflow-y-auto p-4">
          <div class="space-y-3">
            <article
              v-for="role in activeRoles"
              :key="role.id"
              class="rounded-2xl border-0 bg-white p-3 shadow-sm transition hover:scale-[1.02] hover:shadow-lg"
            >
              <div class="mb-2 flex items-start justify-between">
                <div>
                  <div class="text-sm font-semibold text-slate-900">{{ role.name }}</div>
                  <div class="text-xs text-slate-500">{{ role.model }}</div>
                </div>
                <span
                  class="rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide"
                  :class="getRoleStatusStyle(role.status)"
                >
                  {{ role.status }}
                </span>
              </div>
              <div class="flex items-center text-xs text-slate-500">
                <Clock class="mr-1 h-3 w-3" />
                {{ role.lastActive }}
              </div>
            </article>
          </div>
        </div>

        <div class="border-t border-slate-200 p-4">
          <button
            type="button"
            class="flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-purple-300"
            @click="emit('configure-roles')"
          >
            <Settings class="mr-2 h-4 w-4" />
            Configure Roles
          </button>
        </div>
      </aside>

      <main class="flex flex-1 flex-col bg-white">
        <header class="flex items-center justify-between border-b border-purple-200 bg-gradient-to-r from-white to-indigo-50/30 p-4">
          <div>
            <h1 class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-semibold text-transparent">
              {{ workspaceHeading }}
            </h1>
            <p class="text-sm text-slate-600">Collaborate with your AI team</p>
          </div>
          <button
            type="button"
            class="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-purple-300"
          >
            <MoreVertical class="h-4 w-4" />
          </button>
        </header>

        <div class="flex-1">
          <nav class="mt-4 flex gap-2 px-4">
            <button
              type="button"
              :class="tabButtonClass('chat')"
              @click="setTab('chat')"
            >
              Chat
            </button>
            <button
              type="button"
              :class="tabButtonClass('tasks')"
              @click="setTab('tasks')"
            >
              Tasks
            </button>
            <button
              type="button"
              :class="tabButtonClass('files')"
              @click="setTab('files')"
            >
              Files
            </button>
          </nav>

          <section
            v-if="activeTab === 'chat'"
            class="flex h-[calc(100%-4rem)] flex-col"
          >
            <div class="flex-1 overflow-y-auto p-4">
              <div class="mx-auto max-w-3xl space-y-4">
                <div
                  v-for="message in chatMessages"
                  :key="message.id"
                  :class="['flex', message.role === 'user' ? 'justify-end' : 'justify-start']"
                >
                  <div
                    :class="[
                      'max-w-2xl rounded-2xl p-4',
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : 'border border-slate-100 bg-gradient-to-br from-white to-slate-50 text-slate-900 shadow-md'
                    ]"
                  >
                    <div
                      v-if="message.role !== 'user'"
                      class="mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-sm font-semibold text-transparent"
                    >
                      {{ message.role }}
                    </div>
                    <div class="whitespace-pre-wrap text-sm">
                      {{ message.content }}
                    </div>
                    <div
                      :class="[
                        'mt-2 text-right text-xs',
                        message.role === 'user' ? 'text-indigo-100' : 'text-slate-500'
                      ]"
                    >
                      {{ message.timestamp }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <footer class="border-t border-slate-200 p-4">
              <div class="mx-auto flex max-w-3xl gap-2">
                <textarea
                  :value="taskInput"
                  placeholder="Start a new task or ask your AI team..."
                  class="min-h-[5rem] flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  @input="taskInput = ($event.target as HTMLTextAreaElement).value"
                  @keydown="handleKeydown"
                />
                <button
                  type="button"
                  class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transition hover:from-indigo-700 hover:to-purple-700"
                  @click="handleSubmit"
                >
                  <Send class="h-4 w-4" />
                </button>
              </div>
            </footer>
          </section>

          <section
            v-else-if="activeTab === 'tasks'"
            class="h-[calc(100%-4rem)] overflow-y-auto p-4"
          >
            <div class="mx-auto max-w-3xl space-y-3">
              <article
                v-for="task in tasks"
                :key="task.id"
                class="rounded-2xl border-0 bg-white p-4 shadow-md transition hover:scale-[1.02] hover:shadow-lg"
              >
                <div class="flex items-center justify-between">
                  <div class="flex flex-1 items-center gap-3">
                    <div
                      class="h-2 w-2 rounded-full"
                      :class="getTaskStatusDotStyle(task.status)"
                    />
                    <div>
                      <div class="text-sm font-semibold text-slate-900">{{ task.title }}</div>
                      <div class="text-xs text-slate-600">{{ task.assignee }}</div>
                    </div>
                  </div>
                  <span
                    class="inline-flex items-center rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide"
                    :class="getTaskStatusStyle(task.status)"
                  >
                    <CheckCircle
                      v-if="task.status === 'completed'"
                      class="mr-1 h-3 w-3"
                    />
                    {{ task.status.replace('-', ' ') }}
                  </span>
                </div>
              </article>
            </div>
          </section>

          <section
            v-else
            class="h-[calc(100%-4rem)] overflow-y-auto p-4"
          >
            <div class="mx-auto max-w-3xl space-y-3">
              <article
                v-for="file in generatedFiles"
                :key="file.id"
                class="cursor-pointer rounded-2xl border-0 bg-white p-4 shadow-md transition hover:scale-[1.02] hover:shadow-lg"
              >
                <div class="flex items-center gap-4">
                  <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 shadow-md">
                    <component
                      :is="fileIconConfig[file.type]?.component ?? fileIconConfig.document.component"
                      class="h-5 w-5"
                      :class="fileIconConfig[file.type]?.className ?? fileIconConfig.document.className"
                    />
                  </div>
                  <div class="flex-1">
                    <div class="text-sm font-semibold text-slate-900">{{ file.name }}</div>
                    <div class="text-xs text-slate-600">
                      {{ file.size }} • by {{ file.author }}
                    </div>
                  </div>
                  <div class="text-xs text-slate-500">{{ file.date }}</div>
                </div>
              </article>
            </div>
          </section>
        </div>
      </main>
    </div>
  </section>
</template>
