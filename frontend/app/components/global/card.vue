<template>
  <div
      class="rounded-lg border border-white/10 bg-secondary p-6"
      :class="layout === 'side' ? 'flex items-center justify-between gap-6' : 'block'"
  >
    <!-- basic layout -->
    <template v-if="layout === 'default'">
      <div v-if="icon" class="mb-4">
        <Icon :src="icon" alt="icon" aria-hidden class="h-12 w-12" :class="iconColor || 'text-accent'" />
      </div>
      <h2 v-if="title" class="mb-2 text-xl font-semibold">{{ title }}</h2>
      <p v-if="description" class="text-white/70">{{ description }}</p>
    </template>

    <!-- side layout -->
    <template v-else>
      <div class="flex flex-col">
        <h2 v-if="title" class="text-xl font-semibold leading-tight">{{ title }}</h2>
        <p v-if="description" class="text-white/70 text-sm">{{ description }}</p>
      </div>
      <div v-if="icon" class="flex-shrink-0">
        <Icon :src="icon" alt="icon" aria-hidden class="h-12 w-12" :class="iconColor || 'text-accent'" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import Icon from "~/components/global/Icon.vue";

defineProps<{
  icon?: string
  title?: string | number
  description?: string | number
  layout?: 'default' | 'side'
  iconColor?: string
}>()

</script>
