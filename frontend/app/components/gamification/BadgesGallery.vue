<template>
  <div class="bg-secondary/40 rounded-xl p-6 border border-white/5">
    <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
      Hauts-faits
      <span class="text-sm font-normal text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
        {{ earnedCount }} / {{ allBadges.length }}
      </span>
    </h3>

    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
      <div v-for="badge in displayBadges" :key="badge.id"
        class="group relative aspect-square rounded-lg p-1.5 flex flex-col items-center justify-center text-center transition-all duration-300 border"
        :class="[
          isEarned(badge.id)
            ? 'bg-accent/10 border-accent/30 hover:bg-accent/20 cursor-pointer'
            : 'bg-white/5 border-white/5 grayscale opacity-50'
        ]">

        <div class="text-xl mb-1 transform transition-transform group-hover:scale-110">
          {{ badge.icon }}
        </div>

        <h4 class="text-xs font-medium text-white mb-0.5 leading-tight">
          {{ badge.name }}
        </h4>

        <p v-if="isEarned(badge.id)" class="text-[10px] text-accent font-semibold">
          Obtenu !
        </p>

        <!-- Tooltip -->
        <div
          class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-900 border border-white/10 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
          <p class="text-xs text-white/90 font-medium mb-1">{{ badge.name }}</p>
          <p class="text-[10px] text-white/60">{{ badge.description }}</p>
          <p v-if="isEarned(badge.id)" class="text-[10px] text-accent mt-1 pt-1 border-t border-white/10">
            Obtenu le {{ formatDate(getBadgeDate(badge.id)) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Badge, User } from '~/composables/useAuth';

// We duplicate definitions here or fetch them? Use static for now as they are constant in backend logic.
// In a real app we might fetch "available badges" from API.
const allBadges = [
  { id: 'novice', name: 'Novice', description: 'Terminer votre première tâche', icon: '🌟' },
  { id: 'intermediate', name: 'Intermédiaire', description: 'Terminer 10 tâches', icon: '🚀' },
  { id: 'expert', name: 'Expert', description: 'Terminer 100 tâches', icon: '🏆' },
  { id: 'on_fire', name: 'On Fire', description: 'Atteindre une série de 3 jours', icon: '🔥' },
  { id: 'unstoppable', name: 'Inarrêtable', description: 'Atteindre une série de 7 jours', icon: '⚡' },
  { id: 'level_5', name: 'Niveau 5', description: 'Atteindre le niveau 5', icon: '🎖️' },
  { id: 'level_10', name: 'Niveau 10', description: 'Atteindre le niveau 10', icon: '👑' }
];

const props = defineProps<{
  userBadges: Badge[] | undefined;
  limit?: number;
}>();

const earnedIds = computed(() => {
  return new Set((props.userBadges || []).map(b => b.id));
});

const earnedCount = computed(() => earnedIds.value.size);

const displayBadges = computed(() => {
  if (!props.limit) return allBadges;
  // If limited, maybe prioritize earned ones? Or just show first N.
  // Let's show first N of ALL badges (mixed) to show what is achievable.
  return allBadges.slice(0, props.limit);
});

const isEarned = (id: string) => earnedIds.value.has(id);

const getBadgeDate = (id: string) => {
  const badge = props.userBadges?.find(b => b.id === id);
  return badge ? badge.obtainedAt : '';
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString();
};
</script>
