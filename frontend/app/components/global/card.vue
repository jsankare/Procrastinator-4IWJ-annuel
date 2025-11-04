<template>
  <div class="rounded-lg border border-white/10 bg-secondary p-6">
    <div v-if="icon" class="mb-4">
      <img :src="icon" alt="Icon" class="h-12 w-12 object-contain" />
    </div>
    <h2 v-if="title" class="mb-2 text-xl font-semibold">{{ title }}</h2>
    <p v-if="description" class="text-white/70">{{ description }}</p>
  </div>
</template>
<script setup lang="ts">
  defineProps<{
    icon?: string;
    title?: string | number;
    description?: string | number;
  }>();
</script>