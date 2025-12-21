<template>
  <section class="space-y-6">
    <div v-if="!workspace" class="rounded-lg border border-white/10 bg-secondary p-6">
      <h1 class="text-2xl font-semibold">Workspace introuvable</h1>
      <p class="text-white/70 mt-2">Aucun espace avec l'identifiant "{{ idParam }}".</p>
      <NuxtLink to="/workspaces" class="text-accent underline mt-4 inline-block">Retour aux workspaces</NuxtLink>
    </div>

    <div v-else class="space-y-6">
      <header class="relative flex flex-col items-center justify-center py-10 mb-6 bg-linear-to-r from-accent/30 to-secondary/30 rounded-b-3xl shadow-lg">
        <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-accent shadow-lg mb-4 bg-primary flex items-center justify-center">
          <img src="/assets/icons/attention.svg" alt="Avatar workspace" class="object-cover w-full h-full" />
        </div>
        <h1 class="text-3xl font-bold tracking-tight">{{ workspace?.name }}</h1>
        <p class="text-white/80 mt-2 text-center max-w-xl">{{ workspace?.description || 'Aucune description.' }}</p>
        <div class="flex gap-6 mt-4">
          <div class="flex flex-col items-center min-w-20">
            <span class="text-lg font-bold text-accent">{{ totalTasks }}</span>
            <span class="text-xs text-white/70">Tâches</span>
          </div>
          <div class="flex flex-col items-center min-w-20">
            <span class="text-lg font-bold text-green-400">{{ completedTasks }}</span>
            <span class="text-xs text-white/70">Complétées</span>
          </div>
          <div class="flex flex-col items-center min-w-20">
            <span class="text-lg font-bold text-orange-400">{{ tasks.filter((t: { status?: string }) => (t.status || '').toLowerCase() === 'en cours').length }}</span>
            <span class="text-xs text-white/70">En cours</span>
          </div>
        </div>
      </header>

      <div class="grid gap-6 sm:grid-cols-2">
        <div class="rounded-lg border border-white/10 bg-secondary p-6">
          <h2 class="text-xl font-semibold mb-3">Membres</h2>
          <ul class="flex flex-wrap gap-6">
            <li v-for="(u, i) in memberUsers" :key="i" class="flex flex-col items-center w-24">
              <span class="w-14 h-14 rounded-full overflow-hidden border-2 border-accent mb-1 bg-primary flex items-center justify-center">
                <img :src="u.avatar || '/assets/icons/user.svg'" :alt="u.firstName" class="object-cover w-full h-full" />
              </span>
              <span class="text-xs text-center font-medium">{{ u.firstName }}<br>{{ u.lastName }}</span>
            </li>
          </ul>
        </div>

        <div class="rounded-lg border border-white/10 bg-secondary p-6">
          <h2 class="text-xl font-semibold mb-3">Résumé</h2>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center gap-3 p-3 rounded-lg bg-primary/40">
              <span class="bg-accent/20 p-2 rounded-full">
                <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2l4-4" /></svg>
              </span>
              <div>
                <div class="text-lg font-bold">{{ completedTasks }}</div>
                <div class="text-xs text-white/70">Tâches complétées</div>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg bg-primary/40">
              <span class="bg-orange-400/20 p-2 rounded-full">
                <svg class="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2" /></svg>
              </span>
              <div>
                <div class="text-lg font-bold">{{ tasks.filter((t: { status?: string }) => (t.status || '').toLowerCase() === 'en cours').length }}</div>
                <div class="text-xs text-white/70">En cours</div>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg bg-primary/40">
              <span class="bg-blue-400/20 p-2 rounded-full">
                <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" /><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h8" /></svg>
              </span>
              <div>
                <div class="text-lg font-bold">{{ tasks.filter((t: { status?: string }) => (t.status || '').toLowerCase().startsWith('plann')).length }}</div>
                <div class="text-xs text-white/70">Planifiées</div>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg bg-primary/40">
              <span class="bg-accent/20 p-2 rounded-full">
                <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><path stroke-linecap="round" stroke-linejoin="round" d="M3 9h18" /></svg>
              </span>
              <div>
                <div class="text-lg font-bold">{{ totalTasks }}</div>
                <div class="text-xs text-white/70">Total</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Kanban :workspace-id="workspaceId" />
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
// @ts-ignore
import data from '~/data.json'
// @ts-ignore
import Kanban from '~/components/kanban/kanban.vue'
import { useRoute, useHead } from 'nuxt/app'

const route = useRoute()
const idParam = route.params.workspace as string
const workspaceId = Number(idParam)

const workspace = computed(() => data.workspaces.find((w: any) => w.id === workspaceId))

const memberUsers = computed(() => {
  if (!workspace.value) return [] as any[]
  return workspace.value.members
    .map((id: number) => data.users.find((u: any) => u.id === id))
    .filter(Boolean)
})

const tasks = computed(() => data.tasks.filter((t: any) => t.workspaceId === workspaceId))
const totalTasks = computed(() => tasks.value.length)
const completedTasks = computed(() =>
    tasks.value.filter((t: any) => (t.status || '').toLowerCase() === 'terminé').length
)

useHead({
  title: workspace.value ? `${workspace.value.name}` : 'Workspace introuvable'
})
</script>