<template>
  <button class="bg-accent text-secondary font-medium py-2 px-4 sm:py-2 sm:px-4 rounded-md cursor-pointer inline-flex items-center gap-2 text-base sm:text-base focus:outline-none focus:ring-2 focus:ring-accent/50 transition disabled:opacity-60 disabled:cursor-not-allowed">
    <Icon v-if="typeof icon === 'string'" :src="icon as string" class="w-5 h-5 sm:w-5 sm:h-5" aria-hidden />
    <component v-else-if="icon" :is="icon" class="w-5 h-5 sm:w-5 sm:h-5" />
    <span class="truncate">{{ content }}</span>
  </button>
</template>
<script setup lang="ts">
import type { Component } from 'vue'
import Icon from '~/components/global/Icon.vue'

defineProps<{
  content: string;
  icon?: string | Component | object | null
}>();
</script>