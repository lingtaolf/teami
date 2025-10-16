<script setup lang="ts">
import { computed } from 'vue';
import { Bot, Activity, Clock, Sparkles } from 'lucide-vue-next';

interface AiMember {
  id: string;
  name: string;
  role: string;
  model: string;
  lastActive: string;
  focus: string;
  status: 'active' | 'standby' | 'training';
}

const props = defineProps<{
  workspaceName?: string | null;
}>();

const aiMembers: AiMember[] = [
  {
    id: '1',
    name: 'Helix Architect',
    role: 'Systems Architect',
    model: 'Claude-3 Opus',
    lastActive: '3m ago',
    focus: 'Designs scalable service architectures and integration patterns.',
    status: 'active'
  },
  {
    id: '2',
    name: 'Iridium Strategist',
    role: 'Product Strategist',
    model: 'GPT-4 Turbo',
    lastActive: '7m ago',
    focus: 'Aligns roadmap priorities with customer impact and business goals.',
    status: 'active'
  },
  {
    id: '3',
    name: 'Luna Frontend',
    role: 'Frontend Engineer',
    model: 'GPT-4o',
    lastActive: '12m ago',
    focus: 'Crafts delightful UI experiences with responsive, accessible components.',
    status: 'standby'
  },
  {
    id: '4',
    name: 'Atlas QA',
    role: 'Quality Analyst',
    model: 'Claude-3 Sonnet',
    lastActive: '25m ago',
    focus: 'Authoring regression suites and resilience scenarios across features.',
    status: 'training'
  }
];

const heading = computed(() =>
  props.workspaceName ? `${props.workspaceName} • AI Members` : 'AI Members'
);

const subheading = computed(() =>
  props.workspaceName
    ? `Review and orchestrate the specialist AI crew dedicated to ${props.workspaceName}.`
    : 'Review and orchestrate the specialist AI crew supporting every workspace.'
);

const statusStyles: Record<AiMember['status'], string> = {
  active: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
  standby: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white',
  training: 'bg-slate-100 text-slate-600'
};

const statusLabel: Record<AiMember['status'], string> = {
  active: 'Active',
  standby: 'On Standby',
  training: 'Training'
};
</script>

<template>
  <section class="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
    <div class="mx-auto max-w-6xl p-8">
      <header class="mb-8 rounded-3xl bg-gradient-to-br from-purple-600/90 via-indigo-600/90 to-blue-600/80 p-8 text-white shadow-xl">
        <div class="flex items-start justify-between gap-6">
          <div>
            <p class="text-sm uppercase tracking-[0.25em] text-indigo-100">AI Collaboration</p>
            <h1 class="mt-3 text-3xl font-semibold">{{ heading }}</h1>
            <p class="mt-2 max-w-2xl text-indigo-100/90">
              {{ subheading }}
            </p>
          </div>
          <div class="hidden rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-right text-sm font-medium text-indigo-100/90 md:block">
            <div class="flex items-center justify-end gap-2">
              <Activity class="h-4 w-4" />
              <span>Total Members</span>
            </div>
            <div class="mt-2 text-2xl font-semibold">{{ aiMembers.length }}</div>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <article
          v-for="member in aiMembers"
          :key="member.id"
          class="flex flex-col justify-between rounded-3xl border-0 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 shadow-md">
                <Bot class="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 class="text-lg font-semibold text-slate-900">{{ member.name }}</h2>
                <p class="text-sm text-slate-600">{{ member.role }}</p>
              </div>
            </div>
            <span
              class="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-md"
              :class="statusStyles[member.status]"
            >
              {{ statusLabel[member.status] }}
            </span>
          </div>

          <p class="mt-4 text-sm leading-relaxed text-slate-600">{{ member.focus }}</p>

          <div class="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <div class="inline-flex items-center gap-2">
              <Sparkles class="h-4 w-4 text-purple-500" />
              <span class="font-medium text-slate-700">Model</span>
              <span class="text-slate-500">{{ member.model }}</span>
            </div>
            <div class="inline-flex items-center gap-2 text-slate-500">
              <Clock class="h-4 w-4" />
              Last active {{ member.lastActive }}
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
