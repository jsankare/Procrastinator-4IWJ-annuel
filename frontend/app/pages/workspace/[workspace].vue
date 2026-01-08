<template>
  <section class="space-y-6">
    <div
        v-if="loading"
        class="rounded-lg border border-white/10 bg-secondary p-6"
    >
      <div class="flex items-center justify-center py-8">
        <div class="text-white/70">Chargement du workspace...</div>
      </div>
    </div>

    <!-- Error State -->
    <div
        v-else-if="error"
        class="rounded-lg border border-white/10 bg-secondary p-6"
    >
      <h1 class="text-2xl font-semibold">Workspace introuvable</h1>
      <p class="text-white/70 mt-2">{{ error }}</p>
      <NuxtLink
          to="/workspaces"
          class="text-accent underline mt-4 inline-block"
      >Retour aux workspaces
      </NuxtLink
      >
    </div>

    <div v-else-if="workspace" class="space-y-6">
      <header
          class="relative flex flex-col items-center justify-center py-10 mb-6 bg-linear-to-r from-accent/30 to-secondary/30 rounded-b-3xl shadow-lg"
      >
        <div
            class="w-24 h-24 rounded-full overflow-hidden border-4 border-accent shadow-lg mb-4 bg-primary flex items-center justify-center"
        >
          <svg
              class="w-12 h-12 text-accent"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
          >
            <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                ry="2"
            ></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <h1 class="text-3xl font-bold tracking-tight">
          {{ workspace.name }}
        </h1>
        <p class="text-white/80 mt-2 text-center max-w-xl">
          {{ workspace.description || "Aucune description." }}
        </p>

        <div
            class="mt-6 bg-gradient-to-r from-accent/20 to-accent/10 rounded-lg p-6 border border-accent/30"
        >
          <div class="flex flex-col gap-4 items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div
                  class="w-10 h-10 bg-accent/30 rounded-full flex items-center justify-center"
              >
                <svg
                    class="w-5 h-5 text-accent"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                >
                  <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-accent">
                  Inviter des membres
                </h3>
                <p class="text-sm text-white/70">
                  Partagez ce workspace avec votre équipe
                </p>
              </div>
            </div>
            <button
                @click="showInviteModal = true"
                class="px-4 py-2 bg-accent hover:bg-accent/90 text-primary rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
              >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
              Partager
            </button>
          </div>
        </div>

      </header>

      <div class="grid gap-6 sm:grid-cols-2">
        <div class="rounded-lg border border-white/10 bg-secondary p-6">
          <h2 class="text-xl font-semibold mb-3">
            Membres ({{ workspace.members.length }})
          </h2>
          <ul class="flex flex-wrap gap-6">
            <li
                v-for="member in workspace.members"
                :key="member.userId"
                class="flex flex-col items-center w-24"
            >
                            <span
                                class="w-14 h-14 rounded-full overflow-hidden border-2 border-accent mb-1 bg-primary flex items-center justify-center relative"
                            >
                                <img
                                    v-if="member.avatar"
                                    :src="member.avatar"
                                    :alt="`${member.username || member.firstName || 'User'} avatar`"
                                    class="w-full h-full object-cover"
                                />
                                <svg
                                    v-else
                                    class="w-8 h-8 text-white/70"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </span>
              <span class="text-xs text-center font-medium">
                                {{
                  member.username ||
                  member.firstName ||
                  member.userId
                }}
                                <br/>
                                <span class="text-white/50 capitalize">{{
                                    member.role
                                  }}</span>
                            </span>
            </li>
          </ul>
        </div>

        <div class="rounded-lg border border-white/10 bg-secondary p-6">
          <h2 class="text-xl font-semibold mb-3">Résumé</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div
                v-for="(stat, index) in columnStats"
                :key="stat.name"
                class="flex items-center gap-3 p-3 rounded-lg bg-primary/40"
            >
                            <span 
                                class="p-2 rounded-full"
                                :style="{ backgroundColor: `${stat.color}20` }"
                            >
                                <svg
                                    class="w-6 h-6"
                                    :style="{ color: stat.color }"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    viewBox="0 0 24 24"
                                >
                                    <rect
                                        x="3"
                                        y="3"
                                        width="18"
                                        height="18"
                                        rx="2"
                                    />
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M3 9h18"
                                    />
                                </svg>
                            </span>
              <div>
                <div class="text-lg font-bold">
                  {{ stat.count }}
                </div>
                <div class="text-xs text-white/70">
                  {{ stat.name }}
                </div>
              </div>
            </div>
            
            <!-- Total tasks card -->
            <div
                class="flex items-center gap-3 p-3 rounded-lg bg-primary/40"
            >
                            <span class="bg-accent/20 p-2 rounded-full">
                                <svg
                                    class="w-6 h-6 text-accent"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    viewBox="0 0 24 24"
                                >
                                    <rect
                                        x="3"
                                        y="3"
                                        width="18"
                                        height="18"
                                        rx="2"
                                    />
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M3 9h18"
                                    />
                                </svg>
                            </span>
              <div>
                <div class="text-lg font-bold">
                  {{ totalTasks }}
                </div>
                <div class="text-xs text-white/70">Total</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Kanban :workspace-id="workspaceId" @tasks-changed="loadTasks" @columns-changed="loadWorkspace"/>
    </div>

    <!-- Invite Modal -->
    <div
        v-if="showInviteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="showInviteModal = false"
    >
      <div
          class="bg-secondary rounded-lg border border-white/10 p-6 w-full max-w-md mx-4"
      >
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold">Inviter des membres</h3>
          <button
              @click="showInviteModal = false"
              class="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white"
          >
            <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
            >
              <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Invite Code -->
          <div
              class="bg-primary/30 rounded-lg p-4 border border-white/10"
          >
            <label class="block text-sm text-white/70 mb-2"
            >Code d'invitation</label
            >
            <div class="flex items-center gap-2">
              <input
                  type="text"
                  :value="workspace.inviteCode"
                  readonly
                  class="flex-1 bg-primary/50 border border-white/20 rounded px-3 py-2 font-mono text-accent"
              />
              <button
                  @click="copyInviteCode"
                  class="px-3 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded transition-colors"
              >
                {{ codeCopied ? "✓" : "📋" }}
              </button>
            </div>
            <p class="text-xs text-white/50 mt-2">
              Les membres peuvent utiliser ce code sur la page
              "Rejoindre un workspace"
            </p>
          </div>

          <!-- Invite Link -->
          <div
              class="bg-primary/30 rounded-lg p-4 border border-white/10"
          >
            <label class="block text-sm text-white/70 mb-2"
            >Lien d'invitation</label
            >
            <div class="flex items-center gap-2">
              <input
                  type="text"
                  :value="inviteLink"
                  readonly
                  class="flex-1 bg-primary/50 border border-white/20 rounded px-3 py-2 text-sm text-white/90"
              />
              <button
                  @click="copyInviteLink"
                  class="px-3 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded transition-colors"
              >
                {{ linkCopied ? "✓" : "📋" }}
              </button>
            </div>
            <p class="text-xs text-white/50 mt-2">
              Partagez ce lien direct pour que les membres
              rejoignent en un clic
            </p>
          </div>

          <!-- Share Options -->
<!--          <div class="flex gap-2 pt-4 border-t border-white/10">-->
<!--            <button-->
<!--                @click="shareViaEmail"-->
<!--                class="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors flex items-center justify-center gap-2"-->
<!--            >-->
<!--              <svg-->
<!--                  class="w-4 h-4"-->
<!--                  fill="none"-->
<!--                  stroke="currentColor"-->
<!--                  stroke-width="2"-->
<!--                  viewBox="0 0 24 24"-->
<!--              >-->
<!--                <rect-->
<!--                    width="20"-->
<!--                    height="16"-->
<!--                    x="2"-->
<!--                    y="4"-->
<!--                    rx="2"-->
<!--                ></rect>-->
<!--                <path d="m22 7-10 5L2 7"></path>-->
<!--              </svg>-->
<!--              Email-->
<!--            </button>-->
<!--            <button-->
<!--                @click="shareViaWhatsApp"-->
<!--                class="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors flex items-center justify-center gap-2"-->
<!--            >-->
<!--              <svg-->
<!--                  class="w-4 h-4"-->
<!--                  fill="currentColor"-->
<!--                  viewBox="0 0 24 24"-->
<!--              >-->
<!--                <path-->
<!--                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.700"-->
<!--                />-->
<!--              </svg>-->
<!--              WhatsApp-->
<!--            </button>-->
<!--          </div>-->
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import {ref, computed, onMounted} from "vue";
import Kanban from "~/components/kanban/kanban.vue";
import {useRoute, useHead} from "nuxt/app";
import {apiClient} from "~/utils/api";

const route = useRoute();
const workspaceId = route.params.workspace as string;

// Reactive data
const workspace = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const showInviteModal = ref(false);
const codeCopied = ref(false);
const linkCopied = ref(false);

// Real task data from API
const tasks = ref<any[]>([]);

// Load workspace data
const loadWorkspace = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await apiClient.get(`/api/workspaces/${workspaceId}`);

    if (response.success) {
      workspace.value = (response.data as any)?.workspace;
      // Load real tasks for this workspace
      await loadTasks();
    } else {
      error.value =
          response.error ||
          `Aucun espace avec l'identifiant "${workspaceId}".`;
    }
  } catch (err) {
    console.error("Error loading workspace:", err);
    error.value = "Erreur lors du chargement du workspace";
  } finally {
    loading.value = false;
  }
};

// Load tasks for the workspace
const loadTasks = async () => {
  try {
    const response = await apiClient.get(`/api/tasks/workspace/${workspaceId}`);
    if (response.success) {
      tasks.value = (response.data as any)?.tasks || [];
    } else {
      console.error("Error loading tasks:", response.error);
      tasks.value = [];
    }
  } catch (err) {
    console.error("Error loading tasks:", err);
    tasks.value = [];
  }
};

// Computed properties based on real data
const totalTasks = computed(() => tasks.value.length);

// Get task count by column name
const getTaskCountByColumn = (columnName: string) => {
  return tasks.value.filter((t) => t.columnName === columnName).length;
};

// Get statistics for all columns
const columnStats = computed(() => {
  if (!workspace.value?.columns) return [];

  // Sort columns by order (fallback to position) and show all active columns
  const sortedColumns = [...workspace.value.columns]
    .filter(col => col.isActive)
    .sort((a: any, b: any) => {
      const aOrder = (a.order !== undefined && a.order !== null) ? a.order : a.position;
      const bOrder = (b.order !== undefined && b.order !== null) ? b.order : b.position;
      return aOrder - bOrder;
    });

  return sortedColumns.map(col => ({
    name: col.name,
    count: getTaskCountByColumn(col.name),
    color: col.color || '#6366f1'
  }));
});

// Legacy computed properties for backward compatibility with header stats
const completedTasks = computed(() => {
  // Find a column that contains "terminé" or "done" or "complete"
  const completedColumn = workspace.value?.columns?.find((col: any) => 
    col.name.toLowerCase().includes('terminé') || 
    col.name.toLowerCase().includes('done') ||
    col.name.toLowerCase().includes('complete')
  );
  return completedColumn ? getTaskCountByColumn(completedColumn.name) : 0;
});

const inProgressTasks = computed(() => {
  // Find a column that contains "en cours" or "in progress" or "doing"
  const inProgressColumn = workspace.value?.columns?.find((col: any) => 
    col.name.toLowerCase().includes('cours') || 
    col.name.toLowerCase().includes('progress') ||
    col.name.toLowerCase().includes('doing')
  );
  return inProgressColumn ? getTaskCountByColumn(inProgressColumn.name) : 0;
});

const plannedTasks = computed(() => {
  // Find a column that contains "planif" or "todo" or "à faire"
  const plannedColumn = workspace.value?.columns?.find((col: any) => 
    col.name.toLowerCase().includes('planif') || 
    col.name.toLowerCase().includes('todo') ||
    col.name.toLowerCase().includes('faire')
  );
  return plannedColumn ? getTaskCountByColumn(plannedColumn.name) : 0;
});

// Computed invite link
const inviteLink = computed(() => {
  if (!workspace.value) return "";
  return `${window.location.origin}/invite/${workspace.value.inviteCode}`;
});

// Copy invite code functionality
const copyInviteCode = async () => {
  if (!workspace.value) return;

  try {
    await navigator.clipboard.writeText(workspace.value.inviteCode);
    codeCopied.value = true;
    setTimeout(() => {
      codeCopied.value = false;
    }, 2000);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = workspace.value.inviteCode;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    codeCopied.value = true;
    setTimeout(() => {
      codeCopied.value = false;
    }, 2000);
  }
};

// Copy invite link functionality
const copyInviteLink = async () => {
  if (!workspace.value) return;

  try {
    await navigator.clipboard.writeText(inviteLink.value);
    linkCopied.value = true;
    setTimeout(() => {
      linkCopied.value = false;
    }, 2000);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = inviteLink.value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    linkCopied.value = true;
    setTimeout(() => {
      linkCopied.value = false;
    }, 2000);
  }
};

// Share via email
const shareViaEmail = () => {
  const subject = `Invitation au workspace: ${workspace.value?.name}`;
  const body = `Bonjour,\n\nVous êtes invité(e) à rejoindre le workspace "${workspace.value?.name}" sur Procrastinator.\n\nCliquez sur ce lien pour rejoindre: ${inviteLink.value}\n\nOu utilisez le code d'invitation: ${workspace.value?.inviteCode}\n\nÀ bientôt !`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl);
};

// Share via WhatsApp
const shareViaWhatsApp = () => {
  const message = `🎯 Rejoignez le workspace "${workspace.value?.name}" sur Procrastinator!\n\n🔗 Lien direct: ${inviteLink.value}\n\n💡 Code: ${workspace.value?.inviteCode}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
};

// Load workspace on mount
onMounted(() => {
  loadWorkspace();
});

// Update page title
useHead({
  title: computed(() =>
      workspace.value ? `${workspace.value.name}` : "Workspace",
  ),
});
</script>
