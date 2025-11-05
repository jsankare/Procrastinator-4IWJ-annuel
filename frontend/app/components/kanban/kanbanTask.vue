<template>
  <div
      class="bg-secondary rounded-lg p-3 border border-white/10 hover:border-accent transition flex flex-col justify-between"
  >
    <div>
      <h3 class="font-medium text-base mb-1">{{ title }}</h3>
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

const props = defineProps<{
  title: string
  description: string
  dueDate: string
  user?: {
    firstName: string
    lastName: string
  } | null
}>()

const formattedDate = computed(() => {
  const d = new Date(props.dueDate)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
})
</script>
