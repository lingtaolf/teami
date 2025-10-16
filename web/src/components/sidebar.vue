<script setup lang="ts">
import { ref, computed, type Component } from 'vue';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  HelpCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bot
} from 'lucide-vue-next';

const props = defineProps<{
  currentView: string;
  workspaceSelected: boolean;
}>();

const emit = defineEmits<{
  (e: 'navigate', view: string): void;
  (e: 'brand-click'): void;
}>();

const isCollapsed = ref(false);

const activeView = computed(() => {
  if (['create-project', 'ai-roles', 'workspace'].includes(props.currentView)) {
    return 'projects';
  }
  return props.currentView;
});

type NavItem = {
  id: string;
  label: string;
  icon: Component;
};

const navItems = computed(() => {
  const items: NavItem[] = [];

  if (!props.workspaceSelected) {
    items.push({ id: 'workspace-management', label: 'Workspaces', icon: FolderKanban });
    items.push({ id: 'ai-members', label: 'AI Members', icon: Bot });
  }

  if (props.workspaceSelected) {
    items.push({ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard });
    items.push({ id: 'projects', label: 'Projects', icon: FolderKanban });
    items.push({ id: 'ai-members', label: 'AI Members', icon: Bot });
  }

  items.push({ id: 'team', label: 'Team', icon: Users });
  items.push({ id: 'settings', label: 'Settings', icon: Settings });

  return items;
});

const handleNavigate = (view: string) => {
  emit('navigate', view);
};

const toggleCollapsed = () => {
  isCollapsed.value = !isCollapsed.value;
};

const brandLabel = computed(() => (isCollapsed.value ? '' : 'Teami'));
</script>

<template>
  <aside
    :class="[
      'flex h-full flex-col border-r border-purple-200 bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 transition-all duration-200',
      isCollapsed ? 'w-20' : 'w-64'
    ]"
  >
    <button
      type="button"
      class="flex items-center gap-2 px-4 pt-6 text-left transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      @click="emit('brand-click')"
    >
      <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
        <Sparkles class="h-5 w-5 text-white" />
      </div>
      <span
        v-if="brandLabel"
        class="text-lg font-semibold text-slate-900"
      >
        {{ brandLabel }}
      </span>
    </button>

    <nav class="flex-1 px-3 pt-6">
      <button
        v-for="item in navItems"
        :key="item.id"
        type="button"
        @click="handleNavigate(item.id)"
        :class="[
          'mb-1 flex w-full items-center rounded-lg px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
          activeView === item.id
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:from-indigo-700 hover:to-purple-700'
            : 'text-slate-700 hover:bg-white/60',
          isCollapsed ? 'justify-center' : 'justify-start'
        ]"
      >
        <component
          :is="item.icon"
          class="h-4 w-4"
        />
        <span
          v-if="!isCollapsed"
          class="ml-3"
        >
          {{ item.label }}
        </span>
      </button>
    </nav>

    <div
      :class="[
        'border-t border-purple-200 p-4 transition',
        isCollapsed ? 'px-0' : 'px-4'
      ]"
    >
      <button
        type="button"
        :class="[
          'flex w-full items-center rounded-lg px-4 py-2 text-sm text-slate-700 transition hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
          isCollapsed ? 'justify-center px-0' : 'justify-start'
        ]"
      >
        <HelpCircle class="h-4 w-4" />
        <span
          v-if="!isCollapsed"
          class="ml-3"
        >
          Help &amp; Support
        </span>
      </button>
    </div>

    <div class="border-t border-purple-200 p-4">
      <button
        type="button"
        class="flex w-full items-center justify-center rounded-lg border border-purple-300 px-3 py-2 text-sm text-purple-600 transition hover:border-purple-500 hover:text-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        @click="toggleCollapsed"
      >
        <component
          :is="isCollapsed ? ChevronRight : ChevronLeft"
          class="h-4 w-4"
        />
        <span
          v-if="!isCollapsed"
          class="ml-2"
        >
          {{ isCollapsed ? 'Expand' : 'Collapse' }}
        </span>
      </button>
    </div>
  </aside>
</template>
