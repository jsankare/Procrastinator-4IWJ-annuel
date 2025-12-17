<template>
  <div class="flex flex-col gap-6 bg-primary text-text px-2 sm:px-0">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-center sm:text-left">Vos Workspaces</h1>
      <p class="text-text/70 text-center sm:text-left">Sélectionnez un espace pour accéder au board et au leaderboard associé.</p>
    </div>

    <div class="flex flex-wrap gap-2 sm:gap-3">
      <Button content="Rejoindre un workspace" :icon="usersIcon" @click="showJoin = true" />
      <Button content="Créer un workspace" :icon="plusIcon" @click="showCreate = true" />
    </div>

    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2">
      <NuxtLink v-for="ws in workspacesWithDetails" :key="ws.id" :to="`/workspace/${ws.id}`" class="block">
        <WorkspaceCard
          :title="ws.title"
          :description="ws.description"
          :total-tasks="ws.totalTasks"
          :completed-tasks="ws.completedTasks"
          :users="ws.users"
        />
      </NuxtLink>
    </div>

    <!-- Modales -->
    <CreateWorkspaceModal
      v-model:open="showCreate"
      :loading="creating"
      @submit="handleCreate"
    />
    <JoinWorkspaceModal
      v-model:open="showJoin"
      :loading="joining"
      @submit="handleJoin"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import WorkspaceCard from '~/components/global/workspaceCard.vue'
import Button from '~/components/global/button.vue'
import CreateWorkspaceModal from '~/components/workspaces/CreateWorkspaceModal.vue'
import JoinWorkspaceModal from '~/components/workspaces/JoinWorkspaceModal.vue'
import plusIcon from '~/assets/icons/plus.svg'
import usersIcon from '~/assets/icons/users.svg'
import data from '../data.json'

// Assume current user is the first one in data.json
const currentUserId = data.users[0]?.id ?? 1

const userWorkspaces = computed(() => {
  return data.workspaces.filter(ws => ws.members.includes(currentUserId))
})

const workspacesWithDetails = computed(() =>
  userWorkspaces.value.map(ws => {
    const wsUsers = ws.members
      .map(id => data.users.find(u => u.id === id))
      .filter(Boolean)
      .map(u => `${u!.firstName} ${u!.lastName}`)

    const wsTasks = data.tasks.filter(task => task.workspaceId === ws.id)
    const totalTasks = wsTasks.length
    const completedTasks = wsTasks.filter(t => (t.status || '').toLowerCase() === 'terminé').length

    return {
      id: ws.id,
      title: ws.name,
      description: ws.description,
      totalTasks,
      completedTasks,
      users: wsUsers,
      tasks: wsTasks,
    }
  })
)

// État modales
const showCreate = ref(false)
const showJoin = ref(false)
// Loading soumissions
const creating = ref(false)
const joining = ref(false)

// A raccorder au backend prochainement
const handleCreate = async (payload: { name: string; description?: string; visibility: 'private' | 'public' }) => {
  try {
    creating.value = true
    // Exemple: const workspace = await $fetch('/api/workspaces', { method: 'POST', body: payload })
    // navigateTo(`/workspace/${workspace.id}`)
    await new Promise(r => setTimeout(r, 600))
    navigateTo(`/workspace/${encodeURIComponent(payload.name.toLowerCase().replace(/\s+/g, '-'))}`)
  } catch (e) {
    console.error(e)
  } finally {
    creating.value = false
  }
}

const handleJoin = async (payload: { invite: string }) => {
  try {
    joining.value = true
    // Exemple: const workspace = await $fetch('/api/workspaces/join', { method: 'POST', body: payload })
    // navigateTo(`/workspace/${workspace.id}`)
    await new Promise(r => setTimeout(r, 600))
    navigateTo(`/workspace/${payload.invite}`)
  } catch (e) {
    console.error(e)
  } finally {
    joining.value = false
  }
}
</script>