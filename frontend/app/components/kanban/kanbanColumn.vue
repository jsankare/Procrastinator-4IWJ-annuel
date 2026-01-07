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
          tasks.length
          }}</span>

        <button
          v-if="canShowMoveLeft"
          :disabled="!canShowMoveLeft"
          @click="handleMoveLeft"
          :class="[
            'p-1 rounded transition-colors',
            canShowMoveLeft ? 'hover:bg-white/5 text-white/60 hover:text-white opacity-60 hover:opacity-100' : 'opacity-40 cursor-not-allowed text-white/30'
          ]"
          title="Déplacer la colonne vers la gauche"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          v-if="canShowMoveRight"
          :disabled="!canShowMoveRight"
          @click="handleMoveRight"
          :class="[
            'p-1 rounded transition-colors',
            canShowMoveRight ? 'hover:bg-white/5 text-white/60 hover:text-white opacity-60 hover:opacity-100' : 'opacity-40 cursor-not-allowed text-white/30'
          ]"
          title="Déplacer la colonne vers la droite"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button v-if="canDelete" @click="$emit('delete')"
          class="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors opacity-60 hover:opacity-100"
          title="Supprimer cette colonne">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        <div v-if="toast.visible" class="ml-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
          {{ toast.message }}
        </div>
      </div>
    </h2>

    <div
        class="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[70vh] pr-1 custom-scrollbar"
        @dragover.prevent="onColumnDragOver"
        @drop.prevent="onColumnDrop"
    >
      <div
          v-for="(task, index) in sortedTasks"
          :key="task._id || task.id"
          class="rounded-lg will-change-transform"
          draggable="true"
          @dragstart="onDragStart($event, task, index)"
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
            :priority="task.priority"
            :user="task.user"
            @task-click="$emit('task-click', task)"
        />
      </div>

      <p v-if="!sortedTasks.length" class="text-white/40 text-sm italic mt-2 pointer-events-none">
        Aucune tâche
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
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
  [key: string]: any;
}

const props = defineProps<{
  columnId: string;
  title: string;
  color?: string;
  tasks: Task[];
  canDelete?: boolean;
  showMoveLeft?: boolean;
  showMoveRight?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:tasks", tasks: Task[]): void;
  (e: "change", event: any): void; // Re-emit change for parent persistence
  (e: "delete"): void;
  (e: "move-left", columnId: string): void;
  (e: "move-right", columnId: string): void;
  (e: "task-click", task: Task): void;
  (e: "drop", details: { fromColumnId: string; toColumnId: string; taskId: number | string; fromIndex: number; toIndex: number }): void;
}>();

const canShowMoveLeft = computed(() => (props.showMoveLeft === undefined ? true : !!props.showMoveLeft));
const canShowMoveRight = computed(() => (props.showMoveRight === undefined ? true : !!props.showMoveRight));

const toast = ref<{ message: string; visible: boolean }>({ message: "", visible: false });
let toastTimer: ReturnType<typeof setTimeout> | null = null;
function showToast(message: string, ms = 1800) {
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
  toast.value.message = message;
  toast.value.visible = true;
  toastTimer = setTimeout(() => {
    toast.value.visible = false;
    toastTimer = null;
  }, ms);
}

function handleMoveLeft() {
  if (!canShowMoveLeft.value) return;
  emit("move-left", props.columnId);
  showToast("Déplacement vers la gauche demandé");
}

function handleMoveRight() {
  if (!canShowMoveRight.value) return;
  emit("move-right", props.columnId);
  showToast("Déplacement vers la droite demandé");
}

// État local pour survol
const hoverIndex = ref<number | null>(null);
const hoverAfter = ref<boolean>(false);

// Trier les tâches par priorité (urgent d'abord) puis par date
const sortedTasks = computed(() => {
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  
  return [...props.tasks].sort((a, b) => {
    // D'abord par priorité (du plus urgent au moins urgent)
    const aPriority = priorityOrder[a.priority || 'low'];
    const bPriority = priorityOrder[b.priority || 'low'];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority; // Ordre décroissant (high first)
    }
    
    // Ensuite par date (du plus proche au plus lointain)
    const aDate = new Date(a.dueDate).getTime();
    const bDate = new Date(b.dueDate).getTime();
    
    return aDate - bDate; // Ordre croissant (earliest first)
  });
});

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

function onDragStart(e: DragEvent, task: Task, sortedIndex: number) {
  // Trouver l'index original de la tâche dans props.tasks
  const originalIndex = props.tasks.findIndex(t => (t._id || t.id) === (task._id || task.id));
  
  if (originalIndex === -1) return;
  
  const payload: DragPayload = {
    fromCol: props.columnId,
    fromIndex: originalIndex, // Utiliser l'index original
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

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>

<style scoped>
.will-change-transform {
  will-change: transform;
}
</style>
