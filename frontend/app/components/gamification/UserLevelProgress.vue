<template>
  <div class="flex items-center gap-4 bg-secondary/40 rounded-xl p-3 border border-white/5">
    <!-- Level Circle (Static) -->
    <div class="relative flex items-center justify-center w-12 h-12 shrink-0">
      <div class="w-full h-full rounded-full border-4 border-gray-700"></div>
      <div class="absolute inset-0 flex items-center justify-center flex-col">
        <span class="text-[10px] text-white/50 uppercase font-bold leading-none">Lvl</span>
        <span class="text-lg font-bold text-white leading-none">{{ dynamicLevel }}</span>
      </div>
    </div>

    <!-- Stats Text -->
    <div class="flex flex-col flex-grow">
      <div class="flex justify-between items-end mb-1 w-full">
        <span class="text-sm font-medium text-white">Expérience</span>
        <span class="text-xs text-white/50">{{ points }} / {{ nextLevelXP }} XP</span>
      </div>
      <!-- Progress Bar (Linear) -->
      <div class="relative w-full h-2 bg-gray-700 rounded-full mt-1">
        <!-- background track already there -->
        <div class="absolute top-0 left-0 h-full bg-accent rounded-full transition-all duration-500 ease-out"
          :style="{ width: `${progressPercentage}%` }">
        </div>
        <!-- Indicator Knob (always visible, even at 0%) -->
        <div
          class="absolute top-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)] transform -translate-y-1/2 -translate-x-1.5 transition-all duration-500 ease-out"
          :style="{ left: `${progressPercentage}%` }">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  points: number;
}>();

// Calculate dynamic level from points to ensure UI consistency
// Current Formula: 1 + floor(points / 100)
// This ensures that if user has 100 points, they are displayed as Level 2 immediately
const dynamicLevel = computed(() => {
  if (props.points < 0) return 1;
  return 1 + Math.floor(props.points / 100);
});

// We generally expect 100 XP per level based on the formula
const nextLevelXP = computed(() => dynamicLevel.value * 100);
const currentLevelBaseXP = computed(() => (dynamicLevel.value - 1) * 100); // Start of current level

// Calculate progress based on Relative Progress within Level (Visual Bar)
// Text remains Absolute (Total / Total Next)
const progressPercentage = computed(() => {
  if (props.points < 0 || !nextLevelXP.value) return 0;

  const xpInCurrentLevel = props.points - currentLevelBaseXP.value;
  const xpNeededForCurrentLevel = nextLevelXP.value - currentLevelBaseXP.value;

  if (xpNeededForCurrentLevel <= 0) return 100;

  const p = (xpInCurrentLevel / xpNeededForCurrentLevel) * 100;
  return Math.min(Math.max(p, 0), 100);
});

// For the circle, we might want to keep the Level Progress (0-100%) or match the bar.
// Since the user asked for "Total XP in violet", the bar should match the text ratio.
// The Circle typically represents the % towards *next level* in a cyclical way, but let's sync it with the bar for consistency if requested,
// OR keep it as relative-to-level.
// Circular progress logic
const radius = 20;
const circumference = 2 * Math.PI * radius;
const strokeDashoffset = computed(() => {
  return circumference - (progressPercentage.value / 100) * circumference;
});
</script>
