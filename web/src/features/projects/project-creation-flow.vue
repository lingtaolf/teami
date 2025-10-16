<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { ArrowLeft, ArrowRight, Check } from 'lucide-vue-next';
import { createProject } from '@/api/projects';
import type { ProjectRead } from '@/api/projects.types';

interface ProjectData {
  name: string;
  description: string;
  type: string;
  techStack: string[];
}

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  techStack: string[];
}

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'complete', payload: ProjectRead): void;
}>();

const props = defineProps<{
  workspaceId?: string | null;
  workspaceName?: string | null;
}>();

const step = ref(1);
const totalSteps = 3;

const projectData = reactive<ProjectData>({
  name: '',
  description: '',
  type: '',
  techStack: []
});

const projectTemplates: ProjectTemplate[] = [
  {
    id: 'web-app',
    name: 'Web Application',
    description: 'Build modern web applications with responsive design',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS']
  },
  {
    id: 'mobile-app',
    name: 'Mobile Application',
    description: 'Create cross-platform mobile apps',
    techStack: ['React Native', 'Firebase', 'Redux']
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    description: 'Analyze and visualize complex datasets',
    techStack: ['Python', 'Pandas', 'Tableau', 'SQL']
  },
  {
    id: 'api',
    name: 'API Development',
    description: 'Design and build scalable REST APIs',
    techStack: ['Node.js', 'Express', 'MongoDB', 'Swagger']
  }
];

const frontendTechs = ['React', 'Vue.js', 'Angular', 'Next.js', 'Tailwind CSS', 'TypeScript'];
const backendTechs = ['Node.js', 'Python', 'Express', 'Django', 'FastAPI', 'GraphQL'];
const toolingTechs = ['PostgreSQL', 'MongoDB', 'Firebase', 'Redis', 'Docker', 'AWS'];

const progress = computed(() => (step.value / totalSteps) * 100);

const canProceed = computed(() => {
  if (step.value === 1) return projectData.name.trim().length > 0;
  if (step.value === 2) return projectData.type.trim().length > 0;
  if (step.value === 3) return projectData.techStack.length > 0;
  return true;
});

const selectTemplate = (template: ProjectTemplate) => {
  projectData.type = template.name;
  projectData.techStack = [...template.techStack];
};

const toggleTech = (tech: string) => {
  if (projectData.techStack.includes(tech)) {
    projectData.techStack = projectData.techStack.filter((item) => item !== tech);
  } else {
    projectData.techStack = [...projectData.techStack, tech];
  }
};

const isTechSelected = (tech: string) => projectData.techStack.includes(tech);

const headerTitle = computed(() =>
  props.workspaceName ? `Create Project • ${props.workspaceName}` : 'Create New Project'
);
const headerSubtitle = computed(() =>
  props.workspaceName
    ? `Set up your AI team collaboration project for ${props.workspaceName}`
    : 'Set up your AI team collaboration project'
);

const isSaving = ref(false);
const saveError = ref<string | null>(null);

const handleBack = () => {
  if (step.value === 1) {
    emit('back');
  } else {
    step.value -= 1;
  }
};

const submitProject = async () => {
  if (!props.workspaceId) {
    saveError.value = '缺少 Workspace 信息，无法创建项目。';
    return;
  }

  isSaving.value = true;
  saveError.value = null;
  try {
    const created = await createProject({
      workspace_uuid: props.workspaceId,
      name: projectData.name.trim(),
      description: projectData.description.trim() || null,
      labels: projectData.techStack.length ? [...projectData.techStack] : undefined
    });
    emit('complete', created);
  } catch (error) {
    console.error('Failed to create project', error);
    saveError.value =
      error instanceof Error ? error.message : '创建项目失败，请稍后再试。';
  } finally {
    isSaving.value = false;
  }
};

const handleNext = () => {
  if (step.value < totalSteps) {
    step.value += 1;
  } else {
    void submitProject();
  }
};
</script>

<template>
  <section class="flex-1 overflow-auto bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
    <div class="mx-auto max-w-4xl p-8">
      <header class="mb-8">
        <button
          type="button"
          class="mb-4 inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/60"
          @click="handleBack"
        >
          <ArrowLeft class="mr-2 h-4 w-4" />
          Back
        </button>
        <h1 class="mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          {{ headerTitle }}
        </h1>
        <p class="text-slate-600">{{ headerSubtitle }}</p>
      </header>

      <div class="mb-8">
        <div class="mb-4 flex items-center justify-between">
          <div
            v-for="currentStep in [1, 2, 3]"
            :key="currentStep"
            class="flex items-center gap-2 text-sm"
          >
            <div
              :class="[
                'flex h-10 w-10 items-center justify-center rounded-full shadow-lg',
                step >= currentStep
                  ? currentStep === 1
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                    : currentStep === 2
                      ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white'
                      : 'bg-gradient-to-br from-pink-500 to-orange-600 text-white'
                  : 'border-2 border-slate-200 bg-white text-slate-400'
              ]"
            >
              <Check
                v-if="step > currentStep"
                class="h-5 w-5"
              />
              <span v-else>{{ currentStep }}</span>
            </div>
            <span :class="step >= currentStep ? 'text-slate-900' : 'text-slate-500'">
              {{ ['Project Details', 'Project Type', 'Tech Stack'][currentStep - 1] }}
            </span>
          </div>
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-white/60 shadow-inner">
          <div
            class="h-full rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg transition-all"
            :style="{ width: `${progress}%` }"
          />
        </div>
      </div>

      <article class="mb-6 rounded-3xl border-0 bg-white p-8 shadow-lg">
        <div
          v-if="step === 1"
          class="space-y-6"
        >
          <div>
            <label class="text-sm font-medium text-slate-700">Project Name</label>
            <input
              v-model="projectData.name"
              type="text"
              placeholder="E-Commerce Platform"
              class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label class="text-sm font-medium text-slate-700">Project Description</label>
            <textarea
              v-model="projectData.description"
              placeholder="Describe what you want to build..."
              class="mt-2 w-full min-h-[8rem] rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        <div
          v-else-if="step === 2"
          class="space-y-4"
        >
          <div class="mb-6">
            <h2 class="mb-2 text-slate-900">Select Project Type</h2>
            <p class="text-slate-600">Choose a template to get started quickly</p>
          </div>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              v-for="template in projectTemplates"
              :key="template.id"
              type="button"
              @click="selectTemplate(template)"
              :class="[
                'rounded-3xl border-0 bg-white p-6 text-left shadow-lg transition-all',
                projectData.type === template.name
                  ? 'scale-105 ring-2 ring-purple-500 bg-gradient-to-br from-indigo-50 to-purple-50'
                  : 'hover:scale-105 hover:shadow-2xl'
              ]"
            >
              <h3 class="mb-2 text-lg font-semibold text-slate-900">{{ template.name }}</h3>
              <p class="mb-4 text-sm text-slate-600">{{ template.description }}</p>
              <div class="flex flex-wrap gap-2 text-xs text-slate-500">
                <span
                  v-for="tech in template.techStack.slice(0, 3)"
                  :key="tech"
                  class="rounded-full bg-slate-100 px-3 py-1"
                >
                  {{ tech }}
                </span>
              </div>
            </button>
          </div>
        </div>

        <div
          v-else
          class="space-y-6"
        >
          <div>
            <h2 class="mb-2 text-slate-900">Select Tech Stack</h2>
            <p class="text-slate-600">Choose the technologies for your project</p>
          </div>

          <div class="space-y-6">
            <div>
              <h3 class="mb-3 text-sm font-semibold text-slate-700">Frontend</h3>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tech in frontendTechs"
                  :key="tech"
                  type="button"
                  :class="[
                    'rounded-2xl border px-4 py-2 text-sm transition',
                    isTechSelected(tech)
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'border-slate-200 text-slate-600 hover:border-purple-300'
                  ]"
                  @click="toggleTech(tech)"
                >
                  <Check
                    v-if="isTechSelected(tech)"
                    class="mr-2 h-4 w-4"
                  />
                  {{ tech }}
                </button>
              </div>
            </div>

            <div>
              <h3 class="mb-3 text-sm font-semibold text-slate-700">Backend</h3>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tech in backendTechs"
                  :key="tech"
                  type="button"
                  :class="[
                    'rounded-2xl border px-4 py-2 text-sm transition',
                    isTechSelected(tech)
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'border-slate-200 text-slate-600 hover:border-purple-300'
                  ]"
                  @click="toggleTech(tech)"
                >
                  <Check
                    v-if="isTechSelected(tech)"
                    class="mr-2 h-4 w-4"
                  />
                  {{ tech }}
                </button>
              </div>
            </div>

            <div>
              <h3 class="mb-3 text-sm font-semibold text-slate-700">Database &amp; Tools</h3>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tech in toolingTechs"
                  :key="tech"
                  type="button"
                  :class="[
                    'rounded-2xl border px-4 py-2 text-sm transition',
                    isTechSelected(tech)
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'border-slate-200 text-slate-600 hover:border-purple-300'
                  ]"
                  @click="toggleTech(tech)"
                >
                  <Check
                    v-if="isTechSelected(tech)"
                    class="mr-2 h-4 w-4"
                  />
                  {{ tech }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      <footer class="flex justify-between">
        <button
          type="button"
          class="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-purple-300"
          @click="handleBack"
        >
          <ArrowLeft class="mr-2 h-4 w-4" />
          {{ step === 1 ? 'Cancel' : 'Previous' }}
        </button>

        <button
          type="button"
          class="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="!canProceed || isSaving"
          @click="handleNext"
        >
          <template v-if="step === totalSteps">
            {{ isSaving ? 'Saving...' : 'Create Project' }}
          </template>
          <template v-else>
            Next
            <ArrowRight class="ml-2 h-4 w-4" />
          </template>
        </button>

        <p
          v-if="saveError"
          class="ml-auto mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700"
        >
          {{ saveError }}
        </p>
      </footer>
    </div>
  </section>
</template>
