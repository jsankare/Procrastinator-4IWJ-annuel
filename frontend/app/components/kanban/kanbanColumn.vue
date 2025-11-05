<template>
  <div
      class="flex-shrink-0 w-full lg:w-auto bg-secondary/60 rounded-xl p-4 border border-white/10 flex flex-col"
  >
    <h2 class="text-lg font-semibold mb-3 flex items-center justify-between">
      {{ title }}
      <span class="text-xs text-white/40 font-normal">{{ tasks.length }}</span>
    </h2>

    <div class="flex flex-col gap-3 flex-1">
      <KanbanTask
          v-for="task in tasks"
          :key="task.id"
          :title="task.title"
          :description="task.description"
          :due-date="task.dueDate"
          :user="task.user"
      />
      <p v-if="!tasks.length" class="text-white/40 text-sm italic mt-2">Aucune tâche</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import KanbanTask from './kanbanTask.vue'

defineProps<{
  title: string
  tasks: {
    id: number
    title: string
    description: string
    dueDate: string
    user?: { firstName: string; lastName: string } | null
  }[]
}>()
</script>
