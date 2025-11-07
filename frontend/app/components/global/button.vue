<template>
  <button class="bg-accent text-secondary font-medium py-2 px-4 rounded-md cursor-pointer inline-flex items-center gap-2">
    <Icon v-if="typeof icon === 'string'" :src="icon as string" class="w-5 h-5" aria-hidden />
    <component v-else-if="icon" :is="icon" class="w-5 h-5" />
    <span>{{ content }}</span>
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