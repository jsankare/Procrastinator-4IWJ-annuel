<template>
  <div class="shrink-0 w-80 bg-secondary/60 rounded-xl p-4 border border-white/10 flex flex-col"
    :style="{ borderTopColor: color || '#64748b', borderTopWidth: '3px' }">
    <h2 class="text-lg font-semibold mb-3 flex items-center justify-between">
      <span class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: color || '#64748b' }"></div>
        {{ title }}
      </span>
      <div class="flex items-center gap-2">
        <span class="text-xs text-white/40 font-normal">{{
          localTasks.length
          }}</span>
        <button v-if="canDelete" @click="$emit('delete')"
          class="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors opacity-60 hover:opacity-100"
          title="Supprimer cette colonne">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </h2>

    <div class="flex flex-col gap-3 flex-1 min-h-[50px]">
      <draggable v-model="localTasks" group="tasks" item-key="id" class="flex flex-col gap-3 h-full"
        ghost-class="opacity-50" drag-class="cursor-grabbing" @change="onChange">
        <div v-for="element in localTasks" :key="element.id" class="rounded-lg cursor-grab active:cursor-grabbing">
          <KanbanTask :title="element.title" :description="element.description" :due-date="element.dueDate"
            :user="element.user" />
        </div>
      </draggable>

      <p v-if="!localTasks.length" class="text-white/40 text-sm italic mt-2 pointer-events-none">
        Aucune tâche
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { VueDraggableNext as draggable } from 'vue-draggable-next';
import KanbanTask from "./kanbanTask.vue";

export interface Task {
  id: number | string;
  title: string;
  description: string;
  dueDate: string;
  status?: string;
  workspaceId?: string | number;
  assignedTo?: string | number;
  user?: { firstName: string; lastName: string } | null;
  [key: string]: any;
}

const props = defineProps<{
  columnId: string;
  title: string;
  color?: string;
  tasks: Task[];
  canDelete?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:tasks", tasks: Task[]): void;
  (e: "change", event: any): void; // Re-emit change for parent persistence
  (e: "delete"): void;
}>();

// Local copy for v-model binding
const localTasks = computed({
  get: () => props.tasks,
  set: (val) => emit('update:tasks', val)
});

function onChange(event: any) {
  // Re-emit specific change event with columnId context if needed
  // But updating the array via v-model emit upstream is usually enough for the list state.
  // We emit a custom 'change' event to notify parent of movement details explicitly if needed.
  emit("change", { ...event, columnId: props.columnId });
}
</script>
