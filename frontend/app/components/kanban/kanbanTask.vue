<template>
  <div class="relative group bg-secondary rounded-lg p-3 border border-white/10 hover:border-accent transition flex flex-col justify-between cursor-grabbing">
    <!-- Use Icon component to adjust the color else not working, maybe find a better way to do it later -->
    <Icon :src="dragIcon" alt="drag icon" aria-hidden class="absolute top-2 right-2 w-5 h-5 group-hover:opacity-100 pointer-events-none select-none text-accent" />

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
import Icon from "~/components/global/Icon.vue"
import dragIcon from "~/assets/icons/dragndrop.svg"

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
