<template>
  <div class="flex flex-col gap-4 w-full">
    <div v-if="isLoading" class="p-3 rounded-md bg-secondary border border-white/10">Chargement des tâches...</div>
    <div v-else-if="error" class="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400">{{ error }}</div>
    <form @submit.prevent="addColumn" class="flex gap-2 items-center mb-2 px-2 sm:px-0">
      <input v-model="newColumnTitle" placeholder="Nouvelle colonne..." class="rounded-md p-2 bg-primary text-text border border-white/10 w-full max-w-xs" />
      <button type="submit" class="bg-accent text-secondary px-4 py-2 rounded-md font-semibold whitespace-nowrap">Ajouter</button>
    </form>
    <div
      class="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-accent/40 scrollbar-track-transparent"
      style="min-height: 350px;"
    >
      <KanbanColumn
        v-for="col in columns"
        :key="col.id"
        :column-id="col.id"
        :title="col.title"
        :tasks="col.tasks"
        @drop="handleDrop"
        class="min-w-[260px] w-full max-w-xs shrink-0"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch, ref, onMounted } from 'vue'
import KanbanColumn from './kanbanColumn.vue'
import { useTasks, type Task as TaskType } from '~/composables/useTasks'

type Task = TaskType

const props = defineProps<{
  userId?: string | number
  workspaceId?: string | number
}>()

const { tasks, fetchTasksForWorkspace, fetchTasksForUser, updateTaskStatus, isLoading, error } = useTasks()

const filteredTasks = computed<Task[]>(() => tasks.value as Task[])

onMounted(async () => {
  if (props.workspaceId) await fetchTasksForWorkspace(props.workspaceId)
  else if (props.userId) await fetchTasksForUser(props.userId)
})

type ColumnId = 'plannifié' | 'en cours' | 'terminé'
type Column = { id: ColumnId; title: string; tasks: Task[] }

const columns = reactive<Column[]>([
  { id: 'plannifié', title: 'Plannifié', tasks: [] },
  { id: 'en cours',  title: 'En cours',  tasks: [] },
  { id: 'terminé',   title: 'Terminé',   tasks: [] },
])

const newColumnTitle = ref('')
function addColumn() {
  const title = newColumnTitle.value.trim()
  if (!title) return
  // Génère un id unique basé sur le titre (évite les doublons)
  let id = title.toLowerCase().replace(/\s+/g, '-')
  let suffix = 1
  while (columns.some(c => c.id === id)) {
    id = `${id}-${suffix++}`
  }
  columns.push({ id: id as ColumnId, title, tasks: [] })
  newColumnTitle.value = ''
}

function seedColumns() {
  for (const c of columns) c.tasks = []
  const byId = new Map(columns.map((c) => [c.id, c]))
  for (const t of filteredTasks.value) {
    const s = (t.status || '').toLowerCase()
    const key: ColumnId = s === 'en cours' ? 'en cours' : s === 'terminé' ? 'terminé' : 'plannifié'
    byId.get(key)?.tasks.push(t)
  }
}
watch(filteredTasks, seedColumns, { immediate: true })

function handleDrop(details: {
  fromColumnId: string
  toColumnId: string
  taskId: number | string
  fromIndex: number
  toIndex: number
}) {
  const { fromColumnId, toColumnId, taskId, fromIndex } = details
  let { toIndex } = details

  const fromCol = columns.find((c) => c.id === (fromColumnId as ColumnId))
  const toCol   = columns.find((c) => c.id === (toColumnId as ColumnId))
  if (!fromCol || !toCol) return

  // No-op guard: même colonne et aucune vraie translation
  if (fromCol === toCol && (toIndex === fromIndex || toIndex === fromIndex + 1)) {
    return
  }

  // Retrait de la source
  if (fromIndex < 0 || fromIndex >= fromCol.tasks.length) return
  const [item] = fromCol.tasks.splice(fromIndex, 1)
  if (!item || String(item.id) !== String(taskId)) return

  // Réglage d’index si même colonne et insertion plus bas
  if (fromCol === toCol && toIndex > fromIndex) {
    toIndex -= 1
  }

  // Clamp sécurité
  if (toIndex < 0) toIndex = 0
  if (toIndex > toCol.tasks.length) toIndex = toCol.tasks.length

  // Insertion destination
  toCol.tasks.splice(toIndex, 0, item)

  // Mise à jour du statut si colonne changée
  if (fromCol !== toCol) {
    item.status = toCol.id
    // Propagate status update to API
    updateTaskStatus(item.id, toCol.id as any)
  }
}
</script>