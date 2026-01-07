<template>
  <div class="flex flex-col gap-6 bg-primary text-text px-2 sm:px-0">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-center sm:text-left">
        Vos Workspaces
      </h1>
      <p class="text-text/70 text-center sm:text-left">
        Sélectionnez un espace pour accéder au board et au leaderboard
        associé.
      </p>
    </div>

    <div class="flex flex-wrap gap-2 sm:gap-3">
      <Button content="Rejoindre un workspace" :icon="usersIcon" @click="showJoin = true" />
      <Button content="Créer un workspace" :icon="plusIcon" @click="showCreate = true" />
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="text-text/70">Chargement des workspaces...</div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
      {{ error }}
      <button @click="loadWorkspaces()" class="ml-2 underline hover:no-underline">
        Réessayer
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="workspacesWithDetails.length === 0" class="text-center py-8 text-text/70">
      <p>Vous n'êtes membre d'aucun workspace.</p>
      <p class="text-sm mt-2">
        Créez-en un ou rejoignez un workspace existant avec un code
        d'invitation.
      </p>
    </div>

    <!-- Workspaces grid -->
    <div v-else class="grid gap-4 grid-cols-1 sm:grid-cols-2">
      <NuxtLink v-for="ws in workspacesWithDetails" :key="ws.id" :to="`/workspace/${ws.id}`" class="block">
        <WorkspaceCard :title="ws.title" :description="ws.description || ''" :total-tasks="ws.totalTasks"
          :completed-tasks="ws.completedTasks" :users="ws.users" />
      </NuxtLink>
    </div>

    <!-- Modales -->
    <CreateWorkspaceModal v-model:open="showCreate" :loading="creating" @submit="handleCreate" />
    <JoinWorkspaceModal v-model:open="showJoin" :loading="joining" @submit="handleJoin" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import WorkspaceCard from "~/components/global/workspaceCard.vue";
import Button from "~/components/global/button.vue";
import CreateWorkspaceModal from "~/components/workspaces/CreateWorkspaceModal.vue";
import JoinWorkspaceModal from "~/components/workspaces/JoinWorkspaceModal.vue";
import plusIcon from "~/assets/icons/plus.svg";
import usersIcon from "~/assets/icons/users.svg";
import { apiClient } from "~/utils/api";

interface Workspace {
  _id: string
  name: string
  description?: string
  members: any[]
  columns?: any[]
  // Add other properties as needed
}

interface WorkspaceWithStats extends Workspace {
  totalTasks?: number
  completedTasks?: number
}

// Reactive data
const workspaces = ref<WorkspaceWithStats[]>([])
const loading = ref(true)
const error = ref<string | null>(null);

useHead({
  title: 'Mes Workspaces - Procrastinator',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

// Load task statistics for a workspace
const loadWorkspaceStats = async (workspaceId: string): Promise<{ total: number; completed: number }> => {
  try {
    const response = await apiClient.get(`/api/tasks/workspace/${workspaceId}`);
    if (response.success) {
      const tasks = (response.data as any)?.tasks || [];
      const total = tasks.length;
      const completed = tasks.filter((task: any) => {
        const columnName = task.columnName?.toLowerCase() || '';
        return columnName.includes('terminé') || columnName.includes('done') || columnName.includes('complete');
      }).length;
      
      return { total, completed };
    }
  } catch (err) {
    console.error(`Error loading stats for workspace ${workspaceId}:`, err);
  }
  return { total: 0, completed: 0 };
};

const workspacesWithDetails = computed(() =>
  workspaces.value.map((ws) => {
    const wsUsers = ws.members
      .filter((member: any) => member.isActive)
      .map(
        (member: any) =>
          member.username || member.firstName || member.userId,
      );

    return {
      id: ws._id,
      title: ws.name,
      description: ws.description,
      totalTasks: ws.totalTasks || 0,
      completedTasks: ws.completedTasks || 0,
      users: wsUsers,
    };
  }),
);

// Load workspaces on component mount
const loadWorkspaces = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await apiClient.get('/api/workspaces/')
    if (response.success) {
      const fetchedWorkspaces = (response.data as any)?.workspaces || [];
      
      // Load task statistics for each workspace in parallel
      const workspacesWithStats = await Promise.all(
        fetchedWorkspaces.map(async (ws: Workspace) => {
          const stats = await loadWorkspaceStats(ws._id);
          return {
            ...ws,
            totalTasks: stats.total,
            completedTasks: stats.completed,
          };
        })
      );
      
      workspaces.value = workspacesWithStats;
    } else {
      error.value = response.error || "Failed to load workspaces";
    }
  } catch (err: any) {
    if (err.message && (err.message.includes('404') || err.message.includes('not found'))) {
      workspaces.value = [];
    } else {
      console.error("Error loading workspaces:", err);
      error.value = err.message || "Failed to load workspaces";
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadWorkspaces();
});

// Modal states
const showCreate = ref(false);
const showJoin = ref(false);
const creating = ref(false);
const joining = ref(false);

// Create workspace handler
const handleCreate = async (payload: {
  name: string;
  description?: string;
}) => {
  try {
    creating.value = true;
    const response = await apiClient.post<{ workspace: Workspace }>("/api/workspaces/", {
      name: payload.name,
      description: payload.description,
    });

    if (response.success) {
      // Reload workspaces to show the new one
      await loadWorkspaces();
      navigateTo(`/workspace/${response.data!.workspace._id}`);
    } else {
      error.value = response.error || "Failed to create workspace";
    }
  } catch (e) {
    console.error("Error creating workspace:", e);
    error.value = "Failed to create workspace";
  } finally {
    creating.value = false;
  }
};

// Join workspace handler
const handleJoin = async (payload: { invite: string }) => {
  try {
    joining.value = true;
    const response = await apiClient.post<{ workspace: Workspace }>("/api/workspaces/join", {
      inviteCode: payload.invite,
    });

    if (response.success) {
      // Reload workspaces to show the joined one
      await loadWorkspaces();
      navigateTo(`/workspace/${response.data!.workspace._id}`);
    } else {
      error.value = response.error || "Failed to join workspace";
    }
  } catch (e) {
    console.error("Error joining workspace:", e);
    error.value = "Failed to join workspace";
  } finally {
    joining.value = false;
  }
};
</script>
