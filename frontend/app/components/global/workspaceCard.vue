<template>
  <div class="h-full rounded-lg border border-white/10 bg-secondary p-4 sm:p-6 overflow-y-auto">
    <h2 class="mb-1 sm:mb-2 text-lg sm:text-xl font-semibold">{{ title }}</h2>
    <p class="text-white/70 text-xs sm:text-base">{{ description }}</p>
    <div class="flex flex-col justify-between gap-3 sm:gap-4">
      <div>
        <!-- Progress bar -->
        <div class="mt-3 sm:mt-4">
          <div class="h-2 w-full rounded-full bg-white/10 overflow-hidden" aria-label="Avancement des tâches">
            <div
              class="h-full bg-accent transition-all duration-300 rounded-full"
              :style="{ width: `${totalTasks ? Math.min(100, Math.round((completedTasks / totalTasks) * 100)) : 0}%` }"
            />
          </div>
          <p class="mt-2 text-xs sm:text-sm text-white/50">
            Tâches complétées: {{ completedTasks }} / {{ totalTasks }}
          </p>
        </div>

        <!-- Users count -->
        <p class="mt-2 text-xs sm:text-sm text-white/70">
          Utilisateurs: {{ (users && users.length) || 0 }}
        </p>
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