<script setup lang="ts">
import { computed, reactive, type Component } from 'vue';
import { Plus, BarChart3, Building2, Code, Palette, CheckCircle, Settings } from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'add-role'): void;
  (e: 'edit-role', roleId: string): void;
}>();

interface AiRole {
  id: string;
  name: string;
  model: string;
  status: string;
  description: string;
  gradient: string;
  icon: Component;
}

const props = defineProps<{
  workspaceName?: string | null;
}>();

const aiRoles: AiRole[] = [
  {
    id: '1',
    name: 'Product Manager',
    model: 'GPT-4',
    status: 'active',
    description: 'Manages requirements and priorities',
    gradient: 'from-blue-500 to-cyan-600',
    icon: BarChart3
  },
  {
    id: '2',
    name: 'Architect',
    model: 'Claude-3 Opus',
    status: 'active',
    description: 'Designs system architecture',
    gradient: 'from-purple-500 to-indigo-600',
    icon: Building2
  },
  {
    id: '3',
    name: 'Frontend Developer',
    model: 'GPT-4',
    status: 'active',
    description: 'Builds user interfaces',
    gradient: 'from-emerald-500 to-teal-600',
    icon: Code
  },
  {
    id: '4',
    name: 'UI Designer',
    model: 'Figma AI',
    status: 'active',
    description: 'Creates visual designs',
    gradient: 'from-pink-500 to-rose-600',
    icon: Palette
  },
  {
    id: '5',
    name: 'QA Tester',
    model: 'Claude-3 Sonnet',
    status: 'active',
    description: 'Ensures quality and testing',
    gradient: 'from-orange-500 to-amber-600',
    icon: CheckCircle
  }
];

const availableModels = [
  'GPT-4',
  'GPT-3.5 Turbo',
  'Claude-3 Opus',
  'Claude-3 Sonnet',
  'Gemini Pro',
  'Figma AI'
];

const selectedModels = reactive<Record<string, string>>({});

aiRoles.forEach((role) => {
  selectedModels[role.id] = role.model;
});

const handleBack = () => emit('back');
const handleAddRole = () => emit('add-role');
const handleEditRole = (roleId: string) => emit('edit-role', roleId);

const heading = computed(() =>
  props.workspaceName ? `AI Roles • ${props.workspaceName}` : 'AI Roles Configuration'
);
const subheading = computed(() =>
  props.workspaceName
    ? `Configure AI team members and assign models for ${props.workspaceName}`
    : 'Configure AI team members and assign models'
);
</script>

<template>
  <section class="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
    <div class="mx-auto max-w-7xl p-8">
      <header class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {{ heading }}
          </h1>
          <p class="text-slate-600">{{ subheading }}</p>
        </div>
        <div class="flex gap-3">
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-purple-300"
            @click="handleBack"
          >
            Back to Projects
          </button>
          <button
            type="button"
            class="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-700 hover:to-purple-700"
            @click="handleAddRole"
          >
            <Plus class="mr-2 h-4 w-4" />
            Add Custom Role
          </button>
        </div>
      </header>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article
          v-for="role in aiRoles"
          :key="role.id"
          class="rounded-3xl border-0 bg-white p-6 shadow-lg transition duration-300 hover:scale-105 hover:shadow-2xl"
        >
          <div class="mb-4 flex items-start justify-between">
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg" :class="role.gradient">
              <component
                :is="role.icon"
                class="h-7 w-7 text-white"
              />
            </div>
            <span class="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-md">
              {{ role.status }}
            </span>
          </div>

          <h3 class="mb-2 text-lg font-semibold text-slate-900">{{ role.name }}</h3>
          <p class="mb-4 text-sm text-slate-600">{{ role.description }}</p>

          <div class="space-y-3">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-600">Assigned Model</label>
              <div class="relative">
                <select
                  v-model="selectedModels[role.id]"
                  class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option
                    v-for="model in availableModels"
                    :key="model"
                    :value="model"
                  >
                    {{ model }}
                  </option>
                </select>
                <span class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                  ▾
                </span>
              </div>
            </div>

            <button
              type="button"
              class="flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-purple-300"
              @click="handleEditRole(role.id)"
            >
              <Settings class="mr-2 h-4 w-4" />
              Configure Prompt
            </button>
          </div>
        </article>

        <button
          type="button"
          class="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-purple-300 bg-gradient-to-br from-white to-purple-50/40 p-6 text-center transition hover:scale-105 hover:border-purple-500 hover:shadow-xl"
          @click="handleAddRole"
        >
          <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 shadow-md">
            <Plus class="h-7 w-7 text-purple-600" />
          </div>
          <h3 class="mb-2 text-lg font-semibold text-slate-900">Add Custom Role</h3>
          <p class="text-sm text-slate-600">Create a specialized AI role for your project</p>
        </button>
      </div>

      <article class="mt-8 rounded-3xl border-0 bg-gradient-to-br from-white to-indigo-50/30 p-6 shadow-lg">
        <h2 class="mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Global Settings
        </h2>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-600">Default Temperature</label>
            <div class="relative">
              <select
                defaultValue="0.7"
                class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="0.3">0.3 (Focused)</option>
                <option value="0.7">0.7 (Balanced)</option>
                <option value="1.0">1.0 (Creative)</option>
              </select>
              <span class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                ▾
              </span>
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-600">Max Tokens</label>
            <div class="relative">
              <select
                defaultValue="2048"
                class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="1024">1024</option>
                <option value="2048">2048</option>
                <option value="4096">4096</option>
              </select>
              <span class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                ▾
              </span>
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-600">Response Format</label>
            <div class="relative">
              <select
                defaultValue="json"
                class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="text">Text</option>
                <option value="json">JSON</option>
                <option value="markdown">Markdown</option>
              </select>
              <span class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                ▾
              </span>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
