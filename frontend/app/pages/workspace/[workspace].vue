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
        <p class="text-white/70 mt-2">
          Tâches complétées: {{ completedTasks }} / {{ totalTasks }}
        </p>
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
          <p>Planifiées: {{ tasks.filter(t => (t.status || '').toLowerCase().startsWith('plann')).length }}</p>
        </div>
      </div>

      <Kanban :workspace-id="workspaceId" />
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import data from "../../data.json"
import Kanban from "~/components/kanban/kanban.vue"

const route = useRoute()
const idParam = route.params.workspace as string
const workspaceId = Number(idParam)

const workspace = computed(() => data.workspaces.find(w => w.id === workspaceId))
const members = computed(() => {
  if (!workspace.value) return [] as string[]
  return workspace.value.members
      .map(id => data.users.find(u => u.id === id))
      .filter(Boolean)
      .map(u => `${u!.firstName} ${u!.lastName}`)
})

const tasks = computed(() => data.tasks.filter(t => t.workspaceId === workspaceId))
const totalTasks = computed(() => tasks.value.length)
const completedTasks = computed(() =>
    tasks.value.filter(t => (t.status || '').toLowerCase() === 'terminé').length
)

useHead({
  title: workspace.value ? `${workspace.value.name}` : 'Workspace introuvable'
})
</script>