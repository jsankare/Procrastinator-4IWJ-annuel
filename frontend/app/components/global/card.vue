<template>
  <div
      class="rounded-lg border border-white/10 bg-secondary p-6"
      :class="layout === 'side' ? 'flex items-center justify-between gap-6' : 'block'"
  >
    <!-- basic layout -->
    <template v-if="layout === 'default'">
      <div v-if="icon" class="mb-4">
        <img :src="icon" alt="Icon" class="h-12 w-12 object-contain" />
      </div>
      <h2 v-if="title" class="mb-2 text-xl font-semibold">{{ title }}</h2>
      <p v-if="description" class="text-white/70">{{ description }}</p>
    </template>

    <!-- other layout -->
    <template v-else>
      <div class="flex flex-col">
        <h2 v-if="title" class="text-xl font-semibold leading-tight">{{ title }}</h2>
        <p v-if="description" class="text-white/70 text-sm">{{ description }}</p>
      </div>
      <div v-if="icon" class="flex-shrink-0">
        <img :src="icon" alt="Icon" class="h-12 w-12 object-contain" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string | number
  description?: string | number
  layout?: 'default' | 'side'
}>()
</script>
