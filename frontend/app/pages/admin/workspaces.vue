<template>
    <section class="p-6 bg-primary min-h-screen text-text">
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold">Gestion des espaces de travail</h1>
            <div class="flex items-center gap-2">
                <button
                    @click="refresh"
                    class="px-4 py-2 bg-accent text-secondary rounded-md"
                >
                    Actualiser
                </button>
            </div>
        </div>

        <div v-if="!isAdmin" class="p-6 bg-secondary rounded-lg">
            <p class="text-white/70">
                Vous n'avez pas les permissions pour accéder à cette page.
            </p>
        </div>

        <div v-else class="space-y-4">
            <!-- Statistics Cards -->
            <div
                v-if="stats"
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            >
                <div
                    class="bg-secondary/40 rounded-lg p-4 border border-white/10"
                >
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-white/60 text-sm">Total</p>
                            <p class="text-2xl font-bold">{{ stats.total }}</p>
                        </div>
                        <div class="text-blue-400">
                            <svg
                                class="w-8 h-8"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m0 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                ></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div
                    class="bg-secondary/40 rounded-lg p-4 border border-white/10"
                >
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-white/60 text-sm">Actifs</p>
                            <p class="text-2xl font-bold text-green-400">
                                {{ stats.active }}
                            </p>
                        </div>
                        <div class="text-green-400">
                            <svg
                                class="w-8 h-8"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                ></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div
                    class="bg-secondary/40 rounded-lg p-4 border border-white/10"
                >
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-white/60 text-sm">Membres</p>
                            <p class="text-2xl font-bold text-purple-400">
                                {{ stats.totalMembers }}
                            </p>
                        </div>
                        <div class="text-purple-400">
                            <svg
                                class="w-8 h-8"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                ></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div
                    class="bg-secondary/40 rounded-lg p-4 border border-white/10"
                >
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-white/60 text-sm">Cette semaine</p>
                            <p class="text-2xl font-bold text-orange-400">
                                {{ stats.createdThisWeek }}
                            </p>
                        </div>
                        <div class="text-orange-400">
                            <svg
                                class="w-8 h-8"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                ></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Workspaces Table -->
            <div class="rounded-lg border border-white/10 bg-secondary p-4">
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="text-sm text-white/70">
                                <th class="p-3 w-16">#</th>
                                <th class="p-3">Nom</th>
                                <th class="p-3 w-24 text-center">Membres</th>
                                <th class="p-3 w-32 text-center">
                                    Code d'invitation
                                </th>
                                <th class="p-3 w-20 text-center">Statut</th>
                                <th class="p-3 w-32">Créé le</th>
                                <th class="p-3 w-48 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(workspace, i) in workspaces"
                                :key="workspace._id"
                                class="border-t border-white/5"
                            >
                                <td class="p-3 align-middle">
                                    {{ (page - 1) * limit + i + 1 }}
                                </td>
                                <td class="p-3 align-middle">
                                    <div>
                                        <div class="font-medium">
                                            {{ workspace.name }}
                                        </div>
                                        <div
                                            v-if="workspace.description"
                                            class="text-sm text-white/60 truncate max-w-xs"
                                        >
                                            {{ workspace.description }}
                                        </div>
                                    </div>
                                </td>
                                <td class="p-3 align-middle">
                                    <div class="text-center">
                                        <span class="text-lg font-medium">
                                            {{ workspace.members.length }}
                                        </span>
                                    </div>
                                </td>
                                <td class="p-3 align-middle text-center">
                                    <code
                                        class="bg-white/5 px-2 py-1 rounded text-xs"
                                        >{{ workspace.inviteCode }}</code
                                    >
                                </td>
                                <td class="p-3 align-middle text-center">
                                    <span
                                        :class="[
                                            'px-2 py-1 rounded text-xs',
                                            workspace.isActive
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-red-500/20 text-red-400',
                                        ]"
                                    >
                                        {{
                                            workspace.isActive
                                                ? "Actif"
                                                : "Inactif"
                                        }}
                                    </span>
                                </td>
                                <td class="p-3 align-middle">
                                    {{ formatDate(workspace.createdAt) }}
                                </td>
                                <td class="p-3 align-middle">
                                    <div class="grid grid-cols-2 gap-2 w-fit">
                                        <button
                                            @click="openEdit(workspace)"
                                            class="px-3 py-2 bg-white/10 rounded text-sm hover:bg-white/20 text-center min-w-[80px]"
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            @click="openView(workspace)"
                                            class="px-3 py-2 bg-blue-500/10 text-blue-400 rounded text-sm hover:bg-blue-500/20 text-center min-w-[80px]"
                                        >
                                            Voir
                                        </button>
                                        <button
                                            @click="
                                                toggleWorkspaceStatus(workspace)
                                            "
                                            :class="[
                                                'px-3 py-2 rounded text-sm text-center min-w-[80px]',
                                                workspace.isActive
                                                    ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
                                                    : 'bg-green-500/10 text-green-400 hover:bg-green-500/20',
                                            ]"
                                        >
                                            {{
                                                workspace.isActive
                                                    ? "Désactiver"
                                                    : "Activer"
                                            }}
                                        </button>
                                        <button
                                            @click="
                                                confirmHardDelete(workspace)
                                            "
                                            class="px-3 py-2 bg-red-500/10 text-red-400 rounded text-sm hover:bg-red-500/20 text-center min-w-[80px]"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="workspaces.length === 0">
                                <td
                                    colspan="6"
                                    class="p-4 text-center text-white/60"
                                >
                                    Aucun espace de travail trouvé.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="flex items-center justify-between mt-4">
                    <div class="text-sm text-white/60">Total: {{ total }}</div>
                    <div class="flex items-center gap-2">
                        <button
                            :disabled="page <= 1"
                            @click="setPage(page - 1)"
                            class="px-3 py-1 bg-white/5 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Préc
                        </button>
                        <div class="px-3">{{ page }} / {{ totalPages }}</div>
                        <button
                            :disabled="page >= totalPages"
                            @click="setPage(page + 1)"
                            class="px-3 py-1 bg-white/5 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Suiv
                        </button>
                    </div>
                </div>
            </div>

            <!-- Edit Modal -->
            <div
                v-if="showEditModal"
                class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
                <div class="bg-secondary rounded-lg p-6 w-full max-w-lg">
                    <h3 class="text-xl font-bold mb-4">
                        Modifier l'espace de travail
                    </h3>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-sm font-medium mb-1"
                                >Nom</label
                            >
                            <input
                                v-model="editForm.name"
                                class="w-full rounded-md p-2 bg-primary text-text border border-white/10"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1"
                                >Description</label
                            >
                            <textarea
                                v-model="editForm.description"
                                rows="3"
                                class="w-full rounded-md p-2 bg-primary text-text border border-white/10"
                            ></textarea>
                        </div>
                        <div class="flex items-center gap-2">
                            <input
                                type="checkbox"
                                v-model="editForm.isActive"
                                id="editActive"
                            />
                            <label for="editActive" class="text-sm"
                                >Actif</label
                            >
                        </div>
                    </div>

                    <div v-if="error" class="text-red-400 text-sm mt-3">
                        {{ error }}
                    </div>

                    <div class="flex gap-2 justify-end mt-4">
                        <button
                            @click="closeEdit"
                            class="px-4 py-2 bg-white/10 rounded hover:bg-white/20"
                        >
                            Annuler
                        </button>
                        <button
                            @click="saveEdit"
                            :disabled="loading"
                            class="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90 disabled:opacity-50"
                        >
                            <span v-if="!loading">Enregistrer</span>
                            <span v-else>Enregistrement...</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- View Modal -->
            <div
                v-if="showViewModal && viewingWorkspace"
                class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
                <div
                    class="bg-secondary rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
                >
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold">
                            {{ viewingWorkspace.name }}
                        </h3>
                        <button
                            @click="closeView"
                            class="text-white/60 hover:text-white"
                        >
                            <svg
                                class="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                ></path>
                            </svg>
                        </button>
                    </div>

                    <div class="space-y-4">
                        <div>
                            <h4 class="font-semibold mb-2">
                                Informations générales
                            </h4>
                            <div
                                class="bg-primary/50 rounded-lg p-3 space-y-2 text-sm"
                            >
                                <div>
                                    <strong>ID:</strong>
                                    {{ viewingWorkspace._id }}
                                </div>
                                <div>
                                    <strong>Description:</strong>
                                    {{
                                        viewingWorkspace.description ||
                                        "Aucune description"
                                    }}
                                </div>
                                <div>
                                    <strong>Code d'invitation:</strong>
                                    <code class="bg-white/10 px-1 rounded">{{
                                        viewingWorkspace.inviteCode
                                    }}</code>
                                </div>
                                <div>
                                    <strong>Statut:</strong>
                                    <span
                                        :class="
                                            viewingWorkspace.isActive
                                                ? 'text-green-400'
                                                : 'text-red-400'
                                        "
                                    >
                                        {{
                                            viewingWorkspace.isActive
                                                ? "Actif"
                                                : "Inactif"
                                        }}
                                    </span>
                                </div>
                                <div>
                                    <strong>Créé le:</strong>
                                    {{ formatDate(viewingWorkspace.createdAt) }}
                                </div>
                                <div>
                                    <strong>Modifié le:</strong>
                                    {{ formatDate(viewingWorkspace.updatedAt) }}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 class="font-semibold mb-2">
                                Membres ({{ viewingWorkspace.members.length }})
                            </h4>
                            <div class="space-y-2">
                                <div
                                    v-for="member in viewingWorkspace.members"
                                    :key="member.userId"
                                    class="bg-primary/50 rounded-lg p-3 flex items-center justify-between text-sm"
                                >
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-medium">
                                                {{ member.firstName }}
                                                {{ member.lastName }}
                                            </div>
                                            <div class="text-white/60">
                                                @{{ member.username }}
                                            </div>
                                            <div class="text-white/60 text-xs">
                                                {{ member.email }}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span
                                            :class="[
                                                'px-2 py-1 rounded text-xs',
                                                member.role === 'owner'
                                                    ? 'bg-yellow-500/20 text-yellow-400'
                                                    : member.role === 'admin'
                                                      ? 'bg-blue-500/20 text-blue-400'
                                                      : 'bg-gray-500/20 text-gray-400',
                                            ]"
                                        >
                                            {{ member.role }}
                                        </span>
                                        <span
                                            :class="[
                                                'px-2 py-1 rounded text-xs',
                                                member.isActive
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400',
                                            ]"
                                        >
                                            {{
                                                member.isActive
                                                    ? "Actif"
                                                    : "Inactif"
                                            }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end mt-6">
                        <button
                            @click="closeView"
                            class="px-4 py-2 bg-white/10 rounded hover:bg-white/20"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>

            <!-- Delete Confirmation Modal -->
            <div
                v-if="showHardDeleteModal"
                class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
                <div class="bg-secondary rounded-lg p-6 w-full max-w-md">
                    <div class="flex items-center gap-3 mb-4">
                        <div
                            class="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center"
                        >
                            <svg
                                class="w-5 h-5 text-red-400"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                        </div>
                        <h3 class="text-lg font-bold text-red-400">
                            Suppression définitive
                        </h3>
                    </div>
                    <p class="text-sm text-white/70 mb-4">
                        Cette action est
                        <strong class="text-red-400">irréversible</strong>.
                        L'espace de travail
                        <strong>"{{ deletingWorkspace?.name }}"</strong> et
                        toutes ses données seront définitivement supprimées.
                        Tous les membres perdront accès immédiatement.
                    </p>
                    <div
                        class="bg-red-500/10 border border-red-500/20 rounded-md p-3 mb-4"
                    >
                        <p class="text-xs text-red-400">
                            ⚠️ Cette action ne peut pas être annulée
                        </p>
                    </div>
                    <div class="flex gap-2 justify-end">
                        <button
                            @click="cancelDelete"
                            class="px-4 py-2 bg-white/10 rounded hover:bg-white/20"
                        >
                            Annuler
                        </button>
                        <button
                            @click="performHardDelete"
                            :disabled="loading"
                            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                        >
                            <span v-if="!loading"
                                >Supprimer définitivement</span
                            >
                            <span v-else>Suppression...</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div
            v-if="loading && !showEditModal && !showDeleteModal"
            class="fixed bottom-4 right-4 bg-accent text-secondary px-4 py-2 rounded"
        >
            Chargement...
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "~/composables/useAuthStore";
import {
    useAdminWorkspaces,
    type AdminWorkspace,
    type WorkspaceStats,
} from "~/composables/useAdminWorkspaces";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const user = authStore.user;
const router = useRouter();
const adminWorkspaces = useAdminWorkspaces();

const isAdmin = computed(() => !!user.value && user.value.role === "admin");

if (!authStore.token?.value) {
    router.push("/");
}

// Data
const workspaces = ref<AdminWorkspace[]>([]);
const stats = ref<WorkspaceStats | null>(null);
const total = ref(0);
const page = ref(1);
const limit = ref(10);
const totalPages = computed(() =>
    Math.max(1, Math.ceil(total.value / limit.value)),
);

// Edit modal
const showEditModal = ref(false);
const editForm = ref<{
    name: string;
    description: string;
    isActive: boolean;
}>({
    name: "",
    description: "",
    isActive: true,
});
const editingWorkspaceId = ref<string | null>(null);

// View modal
const showViewModal = ref(false);
const viewingWorkspace = ref<AdminWorkspace | null>(null);

// Delete modal
const showHardDeleteModal = ref(false);
const deletingWorkspace = ref<AdminWorkspace | null>(null);

// Methods
async function fetchWorkspaces() {
    if (!isAdmin.value) return;

    const result = await adminWorkspaces.getAllWorkspaces(
        page.value,
        limit.value,
    );
    if (result) {
        workspaces.value = result.workspaces;
        total.value = result.total;
    }
}

async function fetchStats() {
    if (!isAdmin.value) return;

    const result = await adminWorkspaces.getWorkspaceStats();
    if (result) {
        stats.value = result;
    }
}

function setPage(p: number) {
    if (p < 1) p = 1;
    if (p > totalPages.value) p = totalPages.value;
    page.value = p;
    fetchWorkspaces();
}

async function refresh() {
    await Promise.all([fetchWorkspaces(), fetchStats()]);
}

// Edit functions
function openEdit(workspace: AdminWorkspace) {
    editingWorkspaceId.value = workspace._id;
    editForm.value = {
        name: workspace.name,
        description: workspace.description || "",
        isActive: workspace.isActive,
    };
    showEditModal.value = true;
}

function closeEdit() {
    showEditModal.value = false;
    editingWorkspaceId.value = null;
}

async function saveEdit() {
    if (!editingWorkspaceId.value) return;

    const result = await adminWorkspaces.updateWorkspace(
        editingWorkspaceId.value,
        editForm.value,
    );
    if (result) {
        await fetchWorkspaces();
        closeEdit();
    }
}

// View functions
async function openView(workspace: AdminWorkspace) {
    // Fetch full workspace details with enriched member data
    const fullWorkspace = await getWorkspaceById(workspace._id);
    if (fullWorkspace) {
        viewingWorkspace.value = fullWorkspace;
        showViewModal.value = true;
    }
}

function closeView() {
    showViewModal.value = false;
    viewingWorkspace.value = null;
}

// Delete functions
async function toggleWorkspaceStatus(workspace: AdminWorkspace) {
    const result = await adminWorkspaces.updateWorkspace(workspace._id, {
        isActive: !workspace.isActive,
    });
    if (result) {
        await fetchWorkspaces();
    }
}

function confirmHardDelete(workspace: AdminWorkspace) {
    deletingWorkspace.value = workspace;
    showHardDeleteModal.value = true;
}

function cancelDelete() {
    deletingWorkspace.value = null;
    showHardDeleteModal.value = false;
}

async function performHardDelete() {
    if (!deletingWorkspace.value) return;

    const success = await hardDeleteWorkspace(deletingWorkspace.value._id);
    if (success) {
        await fetchWorkspaces();
        cancelDelete();
    }
}

// Utility functions
function formatDate(date: Date | string) {
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Computed
const { loading, error, hardDeleteWorkspace, getWorkspaceById } =
    adminWorkspaces;

onMounted(async () => {
    await authStore.init();
    if (!authStore.token?.value) {
        window.location.href = "/login";
        return;
    }
    await authStore.fetchCurrentUser();
    if (!isAdmin.value) {
        return;
    }
    await Promise.all([fetchWorkspaces(), fetchStats()]);
});
</script>

<style scoped>
@media (max-width: 768px) {
    .overflow-x-auto {
        overflow-x: auto;
    }

    table {
        min-width: 600px;
    }
}

@media (max-width: 640px) {
    table thead {
        display: none;
    }

    table tbody tr {
        display: block;
        background: rgba(255, 255, 255, 0.02);
        margin-bottom: 1rem;
        padding: 1rem;
        border-radius: 0.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    table tbody td {
        display: block;
        padding: 0.5rem 0;
        border: none;
        position: relative;
    }

    table tbody td:before {
        content: attr(data-label);
        font-weight: 600;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.75rem;
        display: block;
        margin-bottom: 0.25rem;
    }

    table tbody td:first-child:before {
        content: "N°";
    }

    table tbody td:nth-child(2):before {
        content: "Nom";
    }

    table tbody td:nth-child(3):before {
        content: "Membres";
    }

    table tbody td:nth-child(4):before {
        content: "Code d'invitation";
    }

    table tbody td:nth-child(5):before {
        content: "Statut";
    }

    table tbody td:nth-child(6):before {
        content: "Créé le";
    }

    table tbody td:nth-child(7):before {
        content: "Actions";
    }

    .grid.grid-cols-2 {
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
    }

    .grid.grid-cols-2 button {
        min-width: auto;
        padding: 0.5rem 0.75rem;
        font-size: 0.75rem;
    }
}
</style>
