<template>
  <div class="h-full rounded-lg border border-white/10 bg-secondary p-6 overflow-y: auto">
    <h2 class="mb-2 text-xl font-semibold">{{ title }}</h2>
    <p class="text-white/70">{{ description }}</p>
    <div class="flex flex-col justify-between gap-4" >
      <div>
        <p class="mt-4 text-sm text-white/50">
          Tâches complétées: {{ completedTasks }} / {{ totalTasks }}
        </p>
        <p>users :</p>
        <ul>
          <li v-for="(user, index) in users" :key="index">{{ user }}</li>
        </ul>
      </div>
      <div>
        <slot />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  totalTasks: number;
  completedTasks: number;
  users?: string[];
}>();
</script>