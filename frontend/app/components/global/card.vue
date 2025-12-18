<template>
  <div
      class="rounded-lg border border-white/10 bg-secondary p-6"
      :class="layout === 'side' ? 'flex items-center justify-between gap-6' : 'block'"
  >
    <section v-if="layout === 'default'" class="flex flex-col gap-4">
      <h2 v-if="title" class="text-xl font-semibold">{{ title }}</h2>
      <p v-if="description" class="text-white/70">{{ description }}</p>
      <div v-if="icon">
        <Icon :src="icon" alt="icon" aria-hidden class="h-12 w-12" :class="iconColor || 'text-accent'" />
      </div>
    </section>

    <div v-else class="contents">
      <div class="flex flex-col">
        <h2 v-if="title" class="text-xl font-semibold leading-tight">{{ title }}</h2>
        <p v-if="description" class="text-white/70 text-sm">{{ description }}</p>
      </div>
      <div v-if="icon" class="flex-shrink-0">
        <Icon :src="icon" alt="icon" aria-hidden class="h-12 w-12" :class="iconColor || 'text-accent'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from "~/components/global/Icon.vue";

withDefaults(defineProps<{
  icon?: string
  title?: string | number
  description?: string | number
  layout?: 'default' | 'side'
  iconColor?: string
}>(), {
  icon: '',
  title: '',
  description: '',
  layout: 'default',
  iconColor: 'text-accent'
})

</script>
