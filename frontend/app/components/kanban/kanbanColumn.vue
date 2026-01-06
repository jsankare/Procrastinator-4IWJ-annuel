<template>
  <div
      class="shrink-0 w-full lg:w-auto bg-secondary/60 rounded-xl p-4 border border-white/10 flex flex-col"
      :style="{ borderTopColor: color || '#64748b', borderTopWidth: '3px' }"
  >
    <h2
        class="text-lg font-semibold mb-3 flex items-center justify-between"
    >
            <span class="flex items-center gap-2">
                <div
                    class="w-3 h-3 rounded-full"
                    :style="{ backgroundColor: color || '#64748b' }"
                ></div>
                {{ title }}
            </span>
      <div class="flex items-center gap-2">
                <span class="text-xs text-white/40 font-normal">{{
                    tasks.length
                  }}</span>
        <button
            v-if="canDelete"
            @click="$emit('delete')"
            class="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors opacity-60 hover:opacity-100"
            title="Supprimer cette colonne"
        >
          <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
          >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </h2>

    <div
        class="flex flex-col gap-3 flex-1"
        @dragover.prevent="onColumnDragOver"
        @drop.prevent="onColumnDrop"
    >
      <div
          v-for="(task, index) in tasks"
          :key="task._id || task.id"
          class="rounded-lg"
          draggable="true"
          @dragstart="onDragStart($event, index)"
          @dragenter.stop.prevent="onTaskDragEnter($event, index)"
          @dragover.stop.prevent="onTaskDragOver($event, index)"
          @dragleave.stop="onTaskDragLeave"
          @drop.stop.prevent="onTaskDrop($event, index)"
          :class="dropClass(index)"
      >
        <KanbanTask
            :title="task.title"
            :description="task.description"
            :due-date="task.dueDate"
            :user="task.user"
            @task-click="$emit('task-click', task)"
        />
      </div>

      <p v-if="!tasks.length" class="text-white/40 text-sm italic mt-2">
        Aucune tâche
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import KanbanTask from "./kanbanTask.vue";

export interface Task {
  _id?: string;
  id?: number | string;
  title: string;
  description: string;
  dueDate: string;
  priority?: 'low' | 'medium' | 'high';
  columnName?: string;
  status?: string;
  workspaceId?: string;
  assignedTo?: number;
  user?: { firstName: string; lastName: string } | null;
}

const props = defineProps<{
  columnId: string;
  title: string;
  color?: string;
  tasks: Task[];
  canDelete?: boolean;
}>();

const emit = defineEmits<{
  (
      e: "drop",
      details: {
        fromColumnId: string;
        toColumnId: string;
        taskId: number | string;
        fromIndex: number;
        toIndex: number;
      },
  ): void;
  (e: "delete"): void;
  (e: "task-click", task: Task): void;
}>();

// État local pour survol
const hoverIndex = ref<number | null>(null);
const hoverAfter = ref<boolean>(false);

function dropClass(index: number) {
  if (hoverIndex.value === null) return "";
  if (hoverIndex.value !== index) return "";
  return "outline outline-1 outline-accent/70";
}

type DragPayload = {
  fromCol: string;
  fromIndex: number;
  taskId: number | string;
};

function onDragStart(e: DragEvent, index: number) {
  const task = props.tasks[index];
  if (!task) return; // évite 'possibly undefined'
  const payload: DragPayload = {
    fromCol: props.columnId,
    fromIndex: index,
    taskId: task._id || task.id || '',
  };
  e.dataTransfer?.setData("text/plain", JSON.stringify(payload));
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
  }
}

function onTaskDragEnter(_e: DragEvent, index: number) {
  hoverIndex.value = index;
  hoverAfter.value = false;
}

function onTaskDragOver(e: DragEvent, index: number) {
  const el = e.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();
  const middle = rect.top + rect.height / 2;
  hoverIndex.value = index;
  hoverAfter.value = e.clientY > middle;
}

function onTaskDragLeave() {
  hoverIndex.value = null;
  hoverAfter.value = false;
}

function onTaskDrop(e: DragEvent, index: number) {
  const raw = e.dataTransfer?.getData("text/plain");
  if (!raw) return;
  const data = safeParse<DragPayload>(raw);
  if (!data) return;

  let toIndex = index + (hoverAfter.value ? 1 : 0);
  emit("drop", {
    fromColumnId: data.fromCol,
    toColumnId: props.columnId,
    taskId: data.taskId,
    fromIndex: data.fromIndex,
    toIndex,
  });

  hoverIndex.value = null;
  hoverAfter.value = false;
}

function onColumnDragOver() {
  // autorise le drop en zone vide
}

function onColumnDrop(e: DragEvent) {
  const raw = e.dataTransfer?.getData("text/plain");
  if (!raw) return;
  const data = safeParse<DragPayload>(raw);
  if (!data) return;

  const toIndex = props.tasks.length;
  emit("drop", {
    fromColumnId: data.fromCol,
    toColumnId: props.columnId,
    taskId: data.taskId,
    fromIndex: data.fromIndex,
    toIndex,
  });

  hoverIndex.value = null;
  hoverAfter.value = false;
}

function safeParse<T>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}
</script>
