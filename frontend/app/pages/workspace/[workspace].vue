<template>
  <section class="space-y-6">
    <div v-if="!currentWorkspace" class="rounded-lg border border-white/10 bg-secondary p-6">
      <h1 class="text-2xl font-semibold">Workspace introuvable</h1>
      <p class="text-white/70 mt-2">Aucun espace avec l'identifiant "{{ idParam }}".</p>
      <NuxtLink to="/workspaces" class="text-accent underline mt-4 inline-block">Retour aux workspaces</NuxtLink>
    </div>

    <div v-else class="space-y-6">
      <header class="relative flex flex-col items-center justify-center py-10 mb-6 bg-linear-to-r from-accent/30 to-secondary/30 rounded-b-3xl shadow-lg">
        <div class="absolute top-4 right-4">
          <button type="button" class="px-4 py-2 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors" @click="handleLeave">Quitter</button>
        </div>
        <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-accent shadow-lg mb-4 bg-primary flex items-center justify-center">
          <img src="/assets/icons/attention.svg" alt="Avatar workspace" class="object-cover w-full h-full" />
        </div>
        <h1 class="text-3xl font-bold tracking-tight">{{ currentWorkspace?.name }}</h1>
        <p class="text-white/80 mt-2 text-center max-w-xl">{{ currentWorkspace?.description || 'Aucune description.' }}</p>
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

      <div v-if="!tasks.length && !completedTasks && !totalTasks" class="rounded-lg border border-white/10 bg-secondary p-6">Aucune tâche pour ce workspace.</div>
      <div v-else class="grid gap-6 sm:grid-cols-2">
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

      <div class="rounded-lg border border-white/10 bg-secondary p-6 space-y-4">
        <div v-if="!tasks.length" class="text-white/60">Aucune tâche à afficher.</div>
        <Kanban v-else :workspace-id="workspaceId" />
      </div>

      <div class="rounded-lg border border-white/10 bg-secondary p-6 space-y-3">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h2 class="text-xl font-semibold">Inviter des membres</h2>
            <p class="text-white/70 text-sm">Partagez le code ou le lien d'invitation pour rejoindre ce workspace.</p>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="p-3 rounded-lg bg-primary/40 border border-white/10">
            <div class="text-xs text-white/60 mb-1">Code d'invitation</div>
            <div class="flex items-center gap-2">
              <span class="font-mono text-sm bg-black/30 px-3 py-2 rounded-md border border-white/10">{{ inviteCode || '—' }}</span>
              <button type="button" class="text-sm px-3 py-2 rounded-md bg-accent text-primary font-semibold" @click="copy(inviteCode)">Copier</button>
            </div>
          </div>
          <div class="p-3 rounded-lg bg-primary/40 border border-white/10">
            <div class="text-xs text-white/60 mb-1">Lien d'invitation</div>
            <div class="flex items-center gap-2">
              <span class="text-xs sm:text-sm break-all bg-black/30 px-3 py-2 rounded-md border border-white/10">{{ inviteLink }}</span>
              <button type="button" class="text-sm px-3 py-2 rounded-md bg-accent text-primary font-semibold" @click="copy(inviteLink)">Copier</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue'
// @ts-ignore
import Kanban from '~/components/kanban/kanban.vue'
import { useRoute, useHead } from 'nuxt/app'
import { useWorkspaces } from '~/composables/useWorkspaces'
import { useTasks } from '~/composables/useTasks'

const route = useRoute()
const idParam = route.params.workspace as string
const workspaceId = idParam

const { currentWorkspace, fetchWorkspaceById, leaveWorkspace } = useWorkspaces()
const { tasks, fetchTasksForWorkspace, completed } = useTasks()

onMounted(async () => {
  await fetchWorkspaceById(workspaceId)
  await fetchTasksForWorkspace(workspaceId)
})

const memberUsers = computed(() => {
  if (!currentWorkspace.value || !Array.isArray(currentWorkspace.value.members)) return [] as any[]
  // Member details should come from backend; placeholder names
  return (currentWorkspace.value.members || []).map(() => ({ firstName: 'Membre', lastName: '', avatar: '' }))
})

const totalTasks = computed(() => tasks.value.length)
const completedTasks = computed(() => completed.value)

const inviteCode = computed(() => currentWorkspace.value?.inviteCode || '')
const inviteLink = computed(() => {
  const origin = process.client ? window.location.origin : 'http://localhost:3000'
  return inviteCode.value ? `${origin}/workspaces?invite=${inviteCode.value}` : ''
})

const copy = async (value: string) => {
  if (!value) return
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(value)
    } catch (e) {
      console.error('Clipboard error', e)
    }
  }
}

const handleLeave = async () => {
  if (confirm('Êtes-vous sûr de vouloir quitter ce workspace ?')) {
    const res = await leaveWorkspace(workspaceId)
    if (res.success) {
      navigateTo('/workspaces')
    }
  }
}

useHead({
  title: currentWorkspace.value ? `${currentWorkspace.value.name}` : 'Workspace introuvable'
})
</script>