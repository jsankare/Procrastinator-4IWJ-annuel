<template>
  <div 
    class="relative group select-none bg-secondary rounded-lg p-3 border border-white/10 hover:border-accent transition flex flex-col justify-between cursor-pointer"
    @click="$emit('task-click')"
  >
    <!-- Use Icon component to adjust the color else not working, maybe find a better way to do it later -->
    <Icon :src="dragIcon" alt="drag icon" aria-hidden
      class="absolute top-2 right-2 w-5 h-5 group-hover:opacity-100 pointer-events-none select-none text-accent" />

    <div>
      <div class="flex items-start justify-between gap-2 mb-1">
        <h3 class="font-medium text-base flex-1">{{ title }}</h3>
        <span 
          v-if="priority"
          class="px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap mr-7"
          :class="priorityClass"
        >
          {{ priorityLabel }}
        </span>
      </div>
      <p class="text-sm text-white/70 line-clamp-2">{{ description }}</p>
    </div>
    <div class="text-xs text-white/50 mt-3 space-y-1">
      <p>Date : {{ formattedDate }}</p>
      <p v-if="user">Pour : {{ user.firstName }} {{ user.lastName }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import Icon from "~/components/global/Icon.vue"
import dragIcon from "~/assets/icons/dragndrop.svg"

const props = defineProps<{
  title: string
  description: string
  dueDate?: string // Make optional
  priority?: 'low' | 'medium' | 'high'
  user?: {
    firstName: string
    lastName: string
  } | null
}>()

defineEmits<{
  (e: 'task-click'): void
}>()


const formattedDate = computed(() => {
  if (!props.dueDate) return ''
  const d = new Date(props.dueDate)
  if (isNaN(d.getTime())) return '' // Handle invalid date strings
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
})

const priorityLabel = computed(() => {
  switch (props.priority) {
    case 'high':
      return 'Urgent'
    case 'medium':
      return 'Moyen'
    case 'low':
      return 'Faible'
    default:
      return ''
  }
})

const priorityClass = computed(() => {
  switch (props.priority) {
    case 'high':
      return 'bg-red-500/20 text-red-400 border border-red-500/30'
    case 'medium':
      return 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
    case 'low':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    default:
      return ''
  }
})
</script>
