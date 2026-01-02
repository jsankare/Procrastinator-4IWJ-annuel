<template>
  <div class="min-h-screen flex items-center justify-center bg-primary">
    <div class="max-w-md w-full mx-4">
      <!-- Loading State -->
      <div
          v-if="loading"
          class="bg-secondary rounded-lg border border-white/10 p-8 text-center"
      >
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
        <h2 class="text-xl font-semibold mb-2">Vérification de l'invitation...</h2>
        <p class="text-white/70">Veuillez patienter</p>
      </div>

      <!-- Error State -->
      <div
          v-else-if="error"
          class="bg-secondary rounded-lg border border-red-500/20 p-8 text-center"
      >
        <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        <h2 class="text-xl font-semibold mb-2 text-red-400">Invitation invalide</h2>
        <p class="text-white/70 mb-6">{{ error }}</p>
        <div class="flex gap-3">
          <NuxtLink
              to="/workspaces"
              class="flex-1 bg-accent/20 hover:bg-accent/30 text-accent border border-accent/40 py-3 px-4 rounded-lg transition-colors text-center"
          >
            Mes Workspaces
          </NuxtLink>
        </div>
      </div>

      <!-- Invitation Card -->
      <div
          v-else-if="workspace"
          class="bg-secondary rounded-lg border border-white/10 p-8"
      >
        <!-- Workspace Header -->
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h1 class="text-2xl font-bold mb-2">Rejoindre le workspace</h1>
          <h2 class="text-xl text-accent font-semibold">{{ workspace.name }}</h2>
          <p v-if="workspace.description" class="text-white/70 mt-2">
            {{ workspace.description }}
          </p>
        </div>

        <!-- Workspace Info -->
        <div class="bg-primary/30 rounded-lg p-4 mb-6 border border-white/5">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm text-white/70">Code d'invitation</span>
            <span class="font-mono font-bold text-accent">{{ workspace.inviteCode }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-white/70">Membres</span>
            <span class="font-semibold">{{ workspace.members.length }} membre{{
                workspace.members.length > 1 ? 's' : ''
              }}</span>
          </div>
        </div>

        <!-- Already Member State -->
        <div v-if="alreadyMember" class="text-center">
          <div class="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p class="text-green-400 font-semibold mb-4">Vous êtes déjà membre de ce workspace!</p>
          <NuxtLink
              :to="`/workspace/${workspace._id}`"
              class="w-full bg-accent hover:bg-accent/90 text-primary py-3 px-6 rounded-lg font-semibold transition-colors inline-block text-center"
          >
            Accéder au workspace
          </NuxtLink>
        </div>

        <!-- Join Actions -->
        <div v-else class="space-y-3">
          <!-- Login Required -->
          <div v-if="!isAuthenticated" class="text-center">
            <p class="text-white/70 mb-4">Vous devez être connecté pour rejoindre ce workspace</p>
            <div class="flex gap-3">
              <NuxtLink
                  to="/login"
                  class="flex-1 bg-accent hover:bg-accent/90 text-primary py-3 px-4 rounded-lg font-semibold transition-colors text-center"
              >
                Se connecter
              </NuxtLink>
              <NuxtLink
                  to="/register"
                  class="flex-1 bg-accent/20 hover:bg-accent/30 text-accent border border-accent/40 py-3 px-4 rounded-lg transition-colors text-center"
              >
                S'inscrire
              </NuxtLink>
            </div>
          </div>

          <!-- Join Button -->
          <div v-else class="text-center">
            <button
                @click="joinWorkspace"
                :disabled="joining"
                class="w-full bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-primary py-3 px-6 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg v-if="joining" class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary"
                   xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ joining ? 'Inscription en cours...' : 'Rejoindre le workspace' }}
            </button>

            <p class="text-xs text-white/50 mt-3">
              En rejoignant ce workspace, vous acceptez de collaborer avec les autres membres.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import {useRoute} from 'nuxt/app';
import {apiClient} from '~/utils/api';

const route = useRoute();
const inviteCode = (route.params.code as string)?.toUpperCase();

// Reactive data
const workspace = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const joining = ref(false);
const alreadyMember = ref(false);

// Check if user is authenticated (simplified - you may want to use a composable)
const isAuthenticated = computed(() => {
  if (import.meta.client) {
    return !!localStorage.getItem('auth_token');
  }
  return false;
});

// Load workspace by invite code
const loadWorkspace = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Validate invite code format
    if (!inviteCode || !/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(inviteCode)) {
      error.value = 'Code d\'invitation invalide. Format attendu: XXXX-XXXX';
      return;
    }

    // First, get user's workspaces to check if already a member
    if (isAuthenticated.value) {
      const userWorkspacesResponse = await apiClient.get('/api/workspaces/');
      if (userWorkspacesResponse.success) {
        const userWorkspaces = userWorkspacesResponse.data?.workspaces || [];
        const existingWorkspace = userWorkspaces.find((ws: any) => ws.inviteCode === inviteCode);
        if (existingWorkspace) {
          workspace.value = existingWorkspace;
          alreadyMember.value = true;
          return;
        }
      }
    }

    // Try to get workspace info (this might fail if not a member, but we can handle that)
    // For now, we'll simulate the workspace data since we don't have a public endpoint
    // In a real implementation, you might want a public endpoint that returns basic workspace info
    workspace.value = {
      name: 'Workspace',
      description: 'Rejoignez ce workspace pour collaborer avec l\'équipe',
      inviteCode: inviteCode,
      members: [{userId: 'placeholder'}], // Placeholder
      _id: 'placeholder'
    };

  } catch (err) {
    console.error('Error loading workspace:', err);
    error.value = 'Code d\'invitation invalide ou expiré';
  } finally {
    loading.value = false;
  }
};

// Join workspace
const joinWorkspace = async () => {
  if (!workspace.value || !isAuthenticated.value) return;

  try {
    joining.value = true;

    const response = await apiClient.post('/api/workspaces/join', {
      inviteCode: inviteCode
    });

    if (response.success) {
      // Successfully joined, redirect to workspace
      await navigateTo(`/workspace/${response.data.workspace._id}`);
    } else {
      error.value = response.error || 'Impossible de rejoindre le workspace';
    }
  } catch (err) {
    console.error('Error joining workspace:', err);
    error.value = 'Erreur lors de l\'adhésion au workspace';
  } finally {
    joining.value = false;
  }
};

// Load workspace on mount
onMounted(() => {
  loadWorkspace();
});

// Set page title
useHead({
  title: computed(() =>
      workspace.value ? `Rejoindre ${workspace.value.name}` : 'Invitation Workspace'
  )
});
</script>
