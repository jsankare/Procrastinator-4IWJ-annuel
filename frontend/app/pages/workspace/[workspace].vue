<script setup lang="ts">
import { computed } from 'vue'
import data from "../../data.json";

const route = useRoute();
const idParam = route.params.workspace as string;
const workspaceId = Number(idParam);

const workspace = computed(() => data.workspaces.find(w => w.id === workspaceId));
const members = computed(() => {
  if (!workspace.value) return [] as string[];
  return workspace.value.members
    .map(id => data.users.find(u => u.id === id))
    .filter(Boolean)
    .map(u => `${u!.firstName} ${u!.lastName}`);
});

const tasks = computed(() => data.tasks.filter(t => t.workspaceId === workspaceId));
const totalTasks = computed(() => tasks.value.length);
const completedTasks = computed(() => tasks.value.filter(t => (t.status || '').toLowerCase() === 'terminé').length);

useHead({
  title: workspace.value ? `Workspace · ${workspace.value.name}` : 'Workspace introuvable',
});
</script>

<template>
  <section class="space-y-6">
    <div v-if="!workspace" class="rounded-lg border border-white/10 bg-secondary p-6">
      <h1 class="text-2xl font-semibold">Workspace introuvable</h1>
      <p class="text-white/70 mt-2">Aucun espace avec l'identifiant "{{ idParam }}".</p>
      <NuxtLink to="/workspaces" class="text-accent underline mt-4 inline-block">Retour aux workspaces</NuxtLink>
    </div>

    <div v-else class="space-y-6">
      <header class="rounded-lg border border-white/10 bg-secondary p-6">
        <h1 class="text-3xl font-bold">{{ workspace?.name }}</h1>
        <p class="text-white/70 mt-2">Tâches complétées: {{ completedTasks }} / {{ totalTasks }}</p>
      </header>

      <div class="grid gap-6 sm:grid-cols-2">
        <div class="rounded-lg border border-white/10 bg-secondary p-6">
          <h2 class="text-xl font-semibold mb-3">Membres</h2>
          <ul class="list-disc pl-5 space-y-1">
            <li v-for="(m, i) in members" :key="i">{{ m }}</li>
          </ul>
        </div>

        <div class="rounded-lg border border-white/10 bg-secondary p-6">
          <h2 class="text-xl font-semibold mb-3">Résumé</h2>
          <p>Total de tâches: {{ totalTasks }}</p>
          <p>Complétées: {{ completedTasks }}</p>
          <p>En cours: {{ tasks.filter(t => (t.status || '').toLowerCase() === 'en cours').length }}</p>
          <p>Planifiées: {{ tasks.filter(t => (t.status || '').toLowerCase().startsWith('plann')) .length }}</p>
        </div>
      </div>

      <div class="rounded-lg border border-white/10 bg-secondary p-6">
        <h2 class="text-xl font-semibold mb-4">Tâches</h2>
        <div v-if="tasks.length === 0" class="text-white/70">Aucune tâche pour cet espace.</div>
        <ul v-else class="space-y-3">
          <li v-for="task in tasks" :key="task.id" class="border border-white/10 rounded-md p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">{{ task.title }}</p>
                <p class="text-white/70 text-sm">{{ task.description }}</p>
              </div>
              <span class="text-sm px-2 py-1 rounded bg-white/10">{{ task.status }}</span>
            </div>
            <div class="text-sm text-white/60 mt-2">
              Assigné à: {{ data.users.find(u => u.id === task.assignedTo)?.firstName }} • Échéance: {{ task.dueDate }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
