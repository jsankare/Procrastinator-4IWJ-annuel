<template>
  <div
      class="flex flex-col lg:grid lg:grid-cols-3 gap-6 overflow-x-auto pb-6 lg:overflow-visible"
  >
    <KanbanColumn
        v-for="col in columns"
        :key="col.status"
        :title="col.title"
        :tasks="col.tasks"
    />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import KanbanColumn from './kanbanColumn.vue'
import data from '~/data.json'

const props = defineProps<{
  userId?: number
  workspaceId?: number
}>()

const filteredTasks = computed(() => {
  if (props.workspaceId)
    return data.tasks
        .filter(t => t.workspaceId === props.workspaceId)
        .map(t => ({
          ...t,
          user: data.users.find(u => u.id === t.assignedTo)
              ? {
                firstName: data.users.find(u => u.id === t.assignedTo)!.firstName,
                lastName: data.users.find(u => u.id === t.assignedTo)!.lastName
              }
              : null
        }))
  if (props.userId)
    return data.tasks
        .filter(t => t.assignedTo === props.userId)
        .map(t => ({
          ...t,
          user: null
        }))
  return []
})

const columns = computed(() => [
  {
    status: 'plannifié',
    title: 'Plannifié',
    tasks: filteredTasks.value.filter(t => t.status.toLowerCase() === 'plannifié')
  },
  {
    status: 'en cours',
    title: 'En cours',
    tasks: filteredTasks.value.filter(t => t.status.toLowerCase() === 'en cours')
  },
  {
    status: 'terminé',
    title: 'Terminé',
    tasks: filteredTasks.value.filter(t => t.status.toLowerCase() === 'terminé')
  }
])
</script>