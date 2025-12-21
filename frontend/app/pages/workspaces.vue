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

    <div>
      <div v-if="isLoading" class="p-4 rounded-lg border border-white/10 bg-secondary">Chargement des workspaces...</div>
      <div v-else-if="error" class="p-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400">{{ error }}</div>
      <div v-else-if="!workspacesWithDetails.length" class="p-4 rounded-lg border border-white/10 bg-secondary">Aucun workspace pour l’instant. Créez ou rejoignez-en un.</div>
      <div v-else class="grid gap-4 grid-cols-1 sm:grid-cols-2">
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
import { ref, computed, onMounted } from 'vue'
import WorkspaceCard from '~/components/global/workspaceCard.vue'
import Button from '~/components/global/button.vue'
import CreateWorkspaceModal from '~/components/workspaces/CreateWorkspaceModal.vue'
import JoinWorkspaceModal from '~/components/workspaces/JoinWorkspaceModal.vue'
import plusIcon from '~/assets/icons/plus.svg'
import usersIcon from '~/assets/icons/users.svg'
import { useAuthStore } from '~/composables/useAuthStore'
import { useWorkspaces } from '~/composables/useWorkspaces'

const authStore = useAuthStore()
const { workspaces, fetchMyWorkspaces, createWorkspace, joinWorkspace, isLoading, error } = useWorkspaces()

onMounted(() => {
  authStore.init()
  fetchMyWorkspaces()
})

const workspacesWithDetails = computed(() =>
  (workspaces.value || []).map(ws => ({
    id: ws.id,
    title: ws.name,
    description: ws.description,
    totalTasks: 0,
    completedTasks: 0,
    users: Array.isArray(ws.members) ? ws.members.map(() => 'Membre') : [],
  }))
)

// État modales
const showCreate = ref(false)
const showJoin = ref(false)
// Loading soumissions
const creating = ref(false)
const joining = ref(false)

const handleCreate = async (payload: { name: string; description?: string; visibility: 'private' | 'public' }) => {
  try {
    creating.value = true
    const res = await createWorkspace(payload)
    if (res.success && res.data) {
      const wsId = res.data.id ?? res.data._id ?? ''
      if (wsId) {
        await fetchMyWorkspaces()
        navigateTo(`/workspace/${wsId}`)
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    creating.value = false
  }
}

const handleJoin = async (payload: { invite: string }) => {
  try {
    joining.value = true
    const res = await joinWorkspace(payload)
    if (res.success && res.data) {
      const wsId = res.data.id ?? res.data._id ?? ''
      if (wsId) {
        await fetchMyWorkspaces()
        navigateTo(`/workspace/${wsId}`)
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    joining.value = false
  }
}
</script>