<template>
    <div class="flex flex-col gap-4 w-full">
        <!-- Column Management Section -->
        <div v-if="canManageColumns" class="px-2 sm:px-0">
            <form @submit.prevent="addColumn" class="flex gap-2 items-center mb-2">
                <input v-model="newColumnTitle" placeholder="Nouvelle colonne..."
                    class="rounded-md p-2 bg-primary text-text border border-white/10 w-full max-w-xs" />
                <button type="submit" :disabled="!newColumnTitle.trim() || addingColumn"
                    class="bg-accent text-secondary px-4 py-2 rounded-md font-semibold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                    <svg v-if="addingColumn" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    {{ addingColumn ? "Ajout..." : "Ajouter" }}
                </button>
            </form>
        </div>

        <!-- No Permission Message -->
        <div v-else-if="!loading && !error && workspace" class="px-2 sm:px-0">
            <div class="bg-secondary/40 border border-white/10 rounded-lg p-4 text-center">
                <div class="flex items-center justify-center gap-2 text-white/60 mb-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span class="text-sm">Contactez un admin pour ajouter une colonne</span>
                </div>
                <p class="text-xs text-white/40">
                    Seuls les propriétaires et administrateurs peuvent gérer les
                    colonnes
                </p>
            </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="text-center">
                <svg class="animate-spin h-8 w-8 mx-auto mb-3 text-accent" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                </svg>
                <div class="text-white/70">Chargement des colonnes...</div>
            </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-center">
            <div class="mb-3">
                <svg class="w-8 h-8 mx-auto mb-2 text-red-400" fill="none" stroke="currentColor" stroke-width="1.5"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
            </div>
            <p class="mb-3">{{ error }}</p>
            <button @click="loadWorkspace()"
                class="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-md transition-colors">
                Réessayer
            </button>
        </div>

        <!-- No Columns Fallback -->
        <div v-else-if="!loading && !error && columns.length === 0" class="flex items-center justify-center py-16">
            <div class="text-center bg-secondary/20 border border-white/10 rounded-lg p-8 max-w-md">
                <div class="mb-4">
                    <svg class="w-12 h-12 mx-auto text-white/30 mb-3" fill="none" stroke="currentColor"
                        stroke-width="1.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-12a3.375 3.375 0 00-3.375 3.375v2.625M6.75 10.5h10.5M12 3.75v6.75" />
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-white mb-2">
                    Sans colonne
                </h3>
                <p class="text-white/60 text-sm mb-4">
                    Cette espace de travail n'a pas encore de colonnes
                    configurées.
                </p>
                <p class="text-white/40 text-xs mb-4">
                    {{
                        canManageColumns
                            ? "Ajoutez votre première colonne ci-dessus pour commencer."
                            : "Contactez un administrateur pour configurer les colonnes."
                    }}
                </p>
                <button @click="loadWorkspace"
                    class="text-accent hover:text-accent/80 text-sm underline hover:no-underline transition-colors">
                    Actualiser
                </button>
            </div>
        </div>

        <!-- Columns -->
        <div v-else-if="!loading && !error && columns.length > 0"
            class="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-accent/40 scrollbar-track-transparent"
            style="min-height: 350px">
            <KanbanColumn v-for="col in columns" :key="col._id" :column-id="col._id" :title="col.name"
                :color="col.color" :tasks="col.tasks" :can-delete="columns.length > 1 && canManageColumns"
                @update:tasks="(newTasks: any) => { col.tasks = newTasks; persistTasks(); }" @change="persistTasks"
                @delete="deleteColumn(col._id)" class="min-w-[260px] w-full max-w-xs shrink-0" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import KanbanColumn from "./kanbanColumn.vue";
import { apiClient } from "~/utils/api";
import {
    generateMockTasksForWorkspace,
    type MockTask,
} from "~/utils/mockTasks";

type Task = MockTask;

type WorkspaceColumn = {
    _id: string;
    name: string;
    color: string;
    position: number;
    createdAt: Date;
    isActive: boolean;
    tasks: Task[];
};

const props = defineProps<{
    workspaceId: string;
    testMode?: "no-columns" | "loading" | "error" | null;
}>();

// User role for permissions (will be passed from parent or fetched)
const userRole = ref<string>("member"); // Default to member
const currentUserId = ref<string>(""); // Current user ID

// Reactive data
const workspace = ref<any>(null); // Use any to bypass strict type check on rapid development
const columns = ref<WorkspaceColumn[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const newColumnTitle = ref("");
const addingColumn = ref(false);

// Persistence Helper
const persistTasks = () => {
    if (!import.meta.client) return;

    // update task properties based on their new column
    const allTasks = columns.value.flatMap(col =>
        col.tasks.map(t => ({
            ...t,
            columnId: col._id,
            status: col.name, // Sync status with column name
            columnName: col.name
        }))
    );

    try {
        localStorage.setItem(`kanban_tasks_${props.workspaceId}`, JSON.stringify(allTasks));
    } catch (e) {
        console.error("Failed to save tasks to localStorage", e);
    }
};

const loadTasksFromStorage = (workspaceId: string): Task[] | null => {
    if (!import.meta.client) return null;
    try {
        const stored = localStorage.getItem(`kanban_tasks_${workspaceId}`);
        return stored ? JSON.parse(stored) : null;
    } catch (e) {
        console.error("Failed to load tasks from localStorage", e);
        return null;
    }
};

// Load workspace data
const loadWorkspace = async () => {
    try {
        loading.value = true;
        error.value = null;

        // Handle test modes
        if (props.testMode === "loading") {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            loading.value = false;
            return;
        }

        if (props.testMode === "error") {
            throw new Error("Test error mode activated");
        }

        if (props.testMode === "no-columns") {
            workspace.value = {
                _id: props.workspaceId,
                name: "Test Workspace",
                members: [{ userId: "test", role: "owner" }],
                columns: [],
            };
            columns.value = [];
            determineUserRole();
            loading.value = false;
            return;
        }

        const response = await apiClient.get(
            `/api/workspaces/${props.workspaceId}`,
        );

        if (response.success) {
            workspace.value = (response.data as any)?.workspace;

            // Determine user role in this workspace
            determineUserRole();

            // Sort columns by position and add tasks array
            const sortedColumns = (workspace.value?.columns || []).sort(
                (a: any, b: any) => a.position - b.position,
            );

            // Try loading from LocalStorage first (Persistence Layer)
            const storedTasks = loadTasksFromStorage(props.workspaceId);
            let tasksToUse: MockTask[] = [];

            if (storedTasks && storedTasks.length > 0) {
                tasksToUse = storedTasks;
            } else {
                // Fallback to random generation if no saved state
                tasksToUse = generateMockTasksForWorkspace(
                    props.workspaceId,
                    sortedColumns,
                    { minTasks: 0, maxTasks: 3 },
                );
            }

            // Assign tasks to columns
            const columnsWithTasks = sortedColumns.map((col: any) => ({
                ...col,
                tasks: tasksToUse.filter((task) =>
                    // Match by ID if possible, otherwise by status name (legacy support)
                    task.columnId === col._id || task.status === col.name
                ),
            }));

            columns.value = columnsWithTasks;

            // Persist initial state to ensure consistency if we just generated mocks
            if (!storedTasks) {
                persistTasks();
            }

        } else {
            error.value = response.error || "Failed to load workspace";
        }
    } catch (err) {
        console.error("Error loading workspace:", err);
        error.value = "Failed to load workspace";
    } finally {
        loading.value = false;
    }
};

// Add column function
const addColumn = async () => {
    const title = newColumnTitle.value.trim();
    if (!title || addingColumn.value) return;

    try {
        addingColumn.value = true;
        const response = await apiClient.post(
            `/api/workspaces/${props.workspaceId}/columns`,
            {
                name: title,
                color: "#64748b", // Default color
            },
        );

        if (response.success) {
            // Reload workspace to get updated columns
            await loadWorkspace();
            newColumnTitle.value = "";
        } else {
            error.value = response.error || "Failed to add column";
        }
    } catch (err) {
        console.error("Error adding column:", err);
        error.value = "Failed to add column";
    } finally {
        addingColumn.value = false;
    }
};

// Delete column function
const deleteColumn = async (columnId: string) => {
    if (columns.value.length <= 1) {
        alert("Impossible de supprimer la dernière colonne");
        return;
    }

    if (!confirm("Êtes-vous sûr de vouloir supprimer cette colonne ?")) {
        return;
    }

    try {
        const response = await apiClient.delete(
            `/api/workspaces/${props.workspaceId}/columns/${columnId}`,
        );

        if (response.success) {
            // Reload workspace to get updated columns
            await loadWorkspace();
        } else {
            error.value = response.error || "Failed to delete column";
        }
    } catch (err) {
        console.error("Error deleting column:", err);
        error.value = "Failed to delete column";
    }
};

// Determine user role in workspace
const determineUserRole = () => {
    if (!workspace.value) return;

    // Get current user ID from localStorage
    if (import.meta.client) {
        const token = localStorage.getItem("auth_token");
        if (token) {
            try {
                const part = token.split(".")[1];
                if (part) {
                    const payload = JSON.parse(atob(part));
                    currentUserId.value = payload.userId;
                }
            } catch (e) {
                console.error("Error parsing token:", e);
            }
        }
    }

    // Find user's role in workspace members
    const member = workspace.value.members?.find(
        (m: any) => m.userId === currentUserId.value,
    );
    if (member) {
        userRole.value = member.role;
    }
};

// Permission helper - flexible for future roles
const canManageColumns = computed(() => {
    if (!workspace.value) return false;

    // Roles that can manage columns - easy to extend
    const allowedRoles = ["owner", "admin", "manager"]; // 'manager' for future use
    return allowedRoles.includes(userRole.value);
});

// Load workspace on mount
onMounted(() => {
    loadWorkspace();
});
</script>
