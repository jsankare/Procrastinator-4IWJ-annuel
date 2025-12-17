<template>
  <div
    class="shrink-0 w-full lg:w-auto bg-secondary/60 rounded-xl p-4 border border-white/10 flex flex-col"
  >
    <h2 class="text-lg font-semibold mb-3 flex items-center justify-between">
      {{ title }}
      <span class="text-xs text-white/40 font-normal">{{ tasks.length }}</span>
    </h2>

    <div
      class="flex flex-col gap-3 flex-1"
      @dragover.prevent="onColumnDragOver"
      @drop.prevent="onColumnDrop"
    >
      <div
        v-for="(task, index) in tasks"
        :key="task.id"
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
        />
      </div>

      <p v-if="!tasks.length" class="text-white/40 text-sm italic mt-2">Aucune tâche</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import KanbanTask from './kanbanTask.vue'

export interface Task {
  id: number | string
  title: string
  description: string
  dueDate: string
  status?: string
  workspaceId?: number
  assignedTo?: number
  user?: { firstName: string; lastName: string } | null
}

const props = defineProps<{
  columnId: string
  title: string
  tasks: Task[]
}>()

const emit = defineEmits<{
  (e: 'drop', details: {
    fromColumnId: string
    toColumnId: string
    taskId: number | string
    fromIndex: number
    toIndex: number
  }): void
}>()

// État local pour survol
const hoverIndex = ref<number | null>(null)
const hoverAfter = ref<boolean>(false)

function dropClass(index: number) {
  if (hoverIndex.value === null) return ''
  if (hoverIndex.value !== index) return ''
  return 'outline outline-1 outline-accent/70'
}

type DragPayload = {
  fromCol: string
  fromIndex: number
  taskId: number | string
}

function onDragStart(e: DragEvent, index: number) {
  const task = props.tasks[index]
  if (!task) return // évite 'possibly undefined'
  const payload: DragPayload = {
    fromCol: props.columnId,
    fromIndex: index,
    taskId: task.id,
  }
  e.dataTransfer?.setData('text/plain', JSON.stringify(payload))
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}

function onTaskDragEnter(_e: DragEvent, index: number) {
  hoverIndex.value = index
  hoverAfter.value = false
}

function onTaskDragOver(e: DragEvent, index: number) {
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const middle = rect.top + rect.height / 2
  hoverIndex.value = index
  hoverAfter.value = e.clientY > middle
}

function onTaskDragLeave() {
  hoverIndex.value = null
  hoverAfter.value = false
}

function onTaskDrop(e: DragEvent, index: number) {
  const raw = e.dataTransfer?.getData('text/plain')
  if (!raw) return
  const data = safeParse<DragPayload>(raw)
  if (!data) return

  let toIndex = index + (hoverAfter.value ? 1 : 0)
  emit('drop', {
    fromColumnId: data.fromCol,
    toColumnId: props.columnId,
    taskId: data.taskId,
    fromIndex: data.fromIndex,
    toIndex,
  })

  hoverIndex.value = null
  hoverAfter.value = false
}

function onColumnDragOver() {
  // autorise le drop en zone vide
}

function onColumnDrop(e: DragEvent) {
  const raw = e.dataTransfer?.getData('text/plain')
  if (!raw) return
  const data = safeParse<DragPayload>(raw)
  if (!data) return

  const toIndex = props.tasks.length
  emit('drop', {
    fromColumnId: data.fromCol,
    toColumnId: props.columnId,
    taskId: data.taskId,
    fromIndex: data.fromIndex,
    toIndex,
  })

  hoverIndex.value = null
  hoverAfter.value = false
}

function safeParse<T>(s: string): T | null {
  try { return JSON.parse(s) as T } catch { return null }
}
</script>