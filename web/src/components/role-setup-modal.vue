<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  roleId?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', payload: { name: string; model: string; prompt: string }): void;
}>();

const defaultPrompts = {
  'Product Manager': `You are an experienced Product Manager for a tech project. Your responsibilities include:
- Analyzing user requirements and translating them into actionable stories
- Prioritizing features based on business value and technical feasibility
- Creating clear documentation and specifications
- Collaborating with the team to ensure alignment

Respond with structured insights and clear recommendations.`,
  Architect: `You are a Senior Software Architect. Your role includes:
- Designing scalable and maintainable system architectures
- Making technology stack decisions
- Creating technical specifications and diagrams
- Ensuring best practices and design patterns

Provide detailed architectural guidance and technical decisions.`,
  'Frontend Developer': `You are an expert Frontend Developer. Your tasks include:
- Building responsive and accessible user interfaces
- Writing clean, maintainable code
- Implementing designs with pixel-perfect accuracy
- Optimizing performance and user experience

Generate production-ready code and best practices.`,
  'UI Designer': `You are a creative UI/UX Designer. Your responsibilities include:
- Creating intuitive and beautiful user interfaces
- Ensuring consistent design systems
- Considering accessibility and usability
- Providing design specifications and assets

Share design recommendations and visual guidance.`,
  'QA Tester': `You are a meticulous QA Engineer. Your role includes:
- Creating comprehensive test plans and test cases
- Identifying bugs and edge cases
- Ensuring quality standards are met
- Documenting issues clearly

Provide thorough testing insights and quality recommendations.`
} as const;

const availableModels = [
  { value: 'gpt-4', label: 'GPT-4', provider: 'OpenAI' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  { value: 'claude-3-opus', label: 'Claude-3 Opus', provider: 'Anthropic' },
  { value: 'claude-3-sonnet', label: 'Claude-3 Sonnet', provider: 'Anthropic' },
  { value: 'gemini-pro', label: 'Gemini Pro', provider: 'Google' },
  { value: 'figma-ai', label: 'Figma AI', provider: 'Figma' }
];

interface RoleForm {
  name: string;
  model: string;
  prompt: string;
}

const useDefaultTemplate = ref(true);
const roleData = reactive<RoleForm>({
  name: '',
  model: 'gpt-4',
  prompt: defaultPrompts['Product Manager']
});

const resetForm = () => {
  roleData.name = '';
  roleData.model = 'gpt-4';
  roleData.prompt = defaultPrompts['Product Manager'];
  useDefaultTemplate.value = true;
};

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      resetForm();
      if (props.roleId) {
        // Placeholder for loading saved role data when backend integration is added.
      }
    }
  }
);

const handleClose = () => {
  emit('close');
};

const handleRoleNameChange = (value: string) => {
  roleData.name = value;
  if (useDefaultTemplate.value && value in defaultPrompts) {
    roleData.prompt = defaultPrompts[value as keyof typeof defaultPrompts];
  }
};

const toggleDefaultTemplate = () => {
  useDefaultTemplate.value = !useDefaultTemplate.value;
  if (!useDefaultTemplate.value) {
    roleData.prompt = '';
  } else if (roleData.name && roleData.name in defaultPrompts) {
    roleData.prompt = defaultPrompts[roleData.name as keyof typeof defaultPrompts];
  } else {
    roleData.name = 'Product Manager';
    roleData.prompt = defaultPrompts['Product Manager'];
  }
};

const isSaveDisabled = computed(() => !roleData.name || !roleData.prompt);

const handleSave = () => {
  if (isSaveDisabled.value) return;
  emit('save', {
    name: roleData.name,
    model: roleData.model,
    prompt: roleData.prompt
  });
  emit('close');
};
</script>

<template>
  <teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center px-4"
      >
        <div
          class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          @click="handleClose"
        />
        <div class="relative z-10 w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
          <header class="mb-6">
            <h2 class="text-2xl font-semibold text-slate-900">
              {{ roleId ? 'Edit AI Role' : 'Create New AI Role' }}
            </h2>
            <p class="mt-1 text-sm text-slate-600">
              Configure how this AI role behaves and which model it uses.
            </p>
          </header>

          <div class="space-y-6">
            <div>
              <label
                class="text-sm font-medium text-slate-700"
                for="role-name"
              >
                Role Name
              </label>
              <input
                id="role-name"
                type="text"
                :value="roleData.name"
                placeholder="e.g., Product Manager, Backend Developer"
                class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                @input="handleRoleNameChange(($event.target as HTMLInputElement).value)"
              />
            </div>

            <div>
              <label
                class="text-sm font-medium text-slate-700"
                for="role-model"
              >
                AI Model / API
              </label>
              <div class="relative mt-2">
                <select
                  id="role-model"
                  v-model="roleData.model"
                  class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option
                    v-for="model in availableModels"
                    :key="model.value"
                    :value="model.value"
                  >
                    {{ model.label }} — {{ model.provider }}
                  </option>
                </select>
                <span class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                  ▾
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <div>
                <p class="text-sm font-medium text-slate-700">Use Default Template</p>
                <p class="text-sm text-slate-600">
                  Start with a pre-configured prompt for common roles.
                </p>
              </div>
              <button
                type="button"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition"
                :class="useDefaultTemplate ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-slate-300'"
                @click="toggleDefaultTemplate"
              >
                <span
                  class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition"
                  :class="useDefaultTemplate ? 'translate-x-5' : 'translate-x-1'"
                />
              </button>
            </div>

            <div>
              <label
                class="text-sm font-medium text-slate-700"
                for="role-prompt"
              >
                System Prompt
              </label>
              <textarea
                id="role-prompt"
                :value="roleData.prompt"
                :disabled="useDefaultTemplate && !roleData.name"
                placeholder="Enter the system prompt that defines this AI role..."
                class="mt-2 w-full min-h-[16rem] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                @input="roleData.prompt = ($event.target as HTMLTextAreaElement).value"
              />
              <p class="mt-2 text-xs text-slate-500">
                The system prompt defines how this AI role will behave and respond to tasks.
              </p>
            </div>

            <details class="border-t border-slate-200 pt-4 text-sm text-slate-600">
              <summary class="cursor-pointer text-slate-900">
                Advanced Settings
              </summary>
              <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label class="text-sm font-medium text-slate-700">Temperature</label>
                  <div class="relative mt-2">
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
                  <label class="text-sm font-medium text-slate-700">Max Tokens</label>
                  <div class="relative mt-2">
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
              </div>
            </details>
          </div>

          <footer class="mt-8 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-purple-300 hover:text-slate-900"
              @click="handleClose"
            >
              Cancel
            </button>
            <button
              type="button"
              class="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isSaveDisabled"
              @click="handleSave"
            >
              {{ roleId ? 'Save Changes' : 'Create Role' }}
            </button>
          </footer>
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
