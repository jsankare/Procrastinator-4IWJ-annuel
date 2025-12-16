<template>
  <div
    class="flex flex-col lg:grid lg:grid-cols-3 gap-6 overflow-x-auto pb-6 lg:overflow-visible"
  >
    <KanbanColumn
      v-for="col in columns"
      :key="col.id"
      :column-id="col.id"
      :title="col.title"
      :tasks="col.tasks"
      @drop="handleDrop"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import KanbanColumn from './kanbanColumn.vue'
import data from '../../data.json'

type Task = {
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
  userId?: number
  workspaceId?: number
}>()

const filteredTasks = computed<Task[]>(() => {
  if (props.workspaceId) {
    return (data.tasks as any[])
      .filter((t) => t.workspaceId === props.workspaceId)
      .map((t) => {
        const u = data.users.find((u) => u.id === t.assignedTo)
        return {
          ...t,
          user: u ? { firstName: u.firstName, lastName: u.lastName } : null,
        } as Task
      })
  }
  if (props.userId) {
    return (data.tasks as any[])
      .filter((t) => t.assignedTo === props.userId)
      .map((t) => ({ ...t, user: null })) as Task[]
  }
  return []
})

type ColumnId = 'plannifié' | 'en cours' | 'terminé'
type Column = { id: ColumnId; title: string; tasks: Task[] }

const columns = reactive<Column[]>([
  { id: 'plannifié', title: 'Plannifié', tasks: [] },
  { id: 'en cours',  title: 'En cours',  tasks: [] },
  { id: 'terminé',   title: 'Terminé',   tasks: [] },
])

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
  }
}
</script>