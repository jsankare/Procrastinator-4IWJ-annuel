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

        <!-- Task Creation Button -->
        <div v-if="!loading && !error && columns.length > 0" class="flex items-center justify-between mb-4 px-2 sm:px-0">
            <h2 class="text-xl font-semibold">Tâches</h2>
            <button
                @click="showCreateTaskModal = true"
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
                        d="M12 4v16m8-8H4"
                    />
                </svg>
                Nouvelle tâche
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
        <div
            v-if="!loading && !error && columns.length > 0"
            class="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-accent/40 scrollbar-track-transparent"
            style="min-height: 350px"
        >
            <KanbanColumn
                v-for="col in columns"
                :key="col._id"
                :column-id="col._id"
                :title="col.name"
                :color="col.color"
                :tasks="col.tasks"
                :can-delete="columns.length > 1 && canManageColumns"
                @drop="handleDrop"
                @delete="deleteColumn(col._id)"
                @task-click="handleTaskClick"
                class="min-w-[260px] w-full max-w-xs shrink-0"
            />
        </div>

        <!-- Create Task Modal -->
        <CreateTaskModal
            :is-open="showCreateTaskModal"
            :workspace-id="workspaceId"
            :columns="workspace?.columns || []"
            :workspace-members="workspace?.members || []"
            @close="showCreateTaskModal = false"
            @created="handleTaskCreated"
        />

        <!-- Edit Task Modal -->
        <EditTaskModal
            :is-open="showEditTaskModal"
            :task="selectedTask"
            :columns="workspace?.columns || []"
            :workspace-members="workspace?.members || []"
            @close="handleCloseEditModal"
            @updated="handleTaskUpdated"
            @deleted="handleTaskDeleted"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import KanbanColumn from "./kanbanColumn.vue";
import CreateTaskModal from "~/components/tasks/CreateTaskModal.vue";
import EditTaskModal from "~/components/tasks/EditTaskModal.vue";
import { apiClient } from "~/utils/api";

type Task = {
    _id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
    status: string;
    columnId?: string;
    columnName: string;
    workspaceId?: string;
};

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
const showCreateTaskModal = ref(false);
const showEditTaskModal = ref(false);
const selectedTask = ref<Task | null>(null);

// Persistence Helper
const persistTasks = async () => {
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

// Handle task move event to check for completion
const onTaskMove = async (columnId: string, evt: any) => {
    if (evt.added) {
        const targetColumn = columns.value.find(c => c._id === columnId);
        if (targetColumn && (targetColumn.name.toLowerCase().includes('terminé') || targetColumn.name.toLowerCase().includes('done'))) {
            // Task moved to done column - reward user!
            try {
                // Check if task was already done to avoid double points (naive check based on previous status if we had it, but here we just assume move to done = reward)
                // Ideally we should check if it wasn't already there. 
                // Since this is a simple implementation:

                // +10 points, +1 completed task
                const authStore = useAuthStore();
                if (authStore.isAuthenticated) {
                    await authApi.updateStats({
                        incrementPoints: 10,
                        incrementCompletedTasks: 1
                    });
                    // Refresh user profile to show new stats
                    await authStore.fetchCurrentUser();
                }
            } catch (e) {
                console.error("Failed to update gamification stats", e);
            }
        }
    }
    persistTasks();
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

            // Sort columns by position
            const sortedColumns = (workspace.value?.columns || []).sort(
                (a: any, b: any) => a.position - b.position,
            );

            // Set loading to false BEFORE loading tasks so Vue can render when tasks are assigned
            loading.value = false;
            
            // Load real tasks from API
            await loadWorkspaceTasks(sortedColumns);
        } else {
            error.value = response.error || "Failed to load workspace";
        }
    } catch (err) {
        console.error("Error loading workspace:", err);
        error.value = "Failed to load workspace";
    } finally {
        // Ensure loading is false even if there's an error
        loading.value = false;
    }
};


// Load tasks for workspace from API
const loadWorkspaceTasks = async (sortedColumns: any[]) => {
    try {
        const response = await apiClient.get(`/api/tasks/workspace/${props.workspaceId}`);
        
        if (response.success && response.data) {
            const workspaceTasks = (response.data as any).tasks || [];
            
            // Assign tasks to their corresponding columns
            const columnsWithTasks = sortedColumns.map((col: any) => {
                const columnTasks = workspaceTasks.filter((task: any) => 
                    task.columnId === col._id || task.columnName === col.name
                );
                
                return {
                    ...col,
                    tasks: columnTasks,
                };
            });

            columns.value = columnsWithTasks;
        } else {
            // Show empty columns if no tasks
            columns.value = sortedColumns.map((col: any) => ({
                ...col,
                tasks: [],
            }));
        }
    } catch (err) {
        console.error("Error loading workspace tasks:", err);
        // Show empty columns on error
        columns.value = sortedColumns.map((col: any) => ({
            ...col,
            tasks: [],
        }));
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

// Handle task drop (for future task management)
const handleDrop = async (details: {
    fromColumnId: string;
    toColumnId: string;
    taskId: number | string;
    fromIndex: number;
    toIndex: number;
}) => {
    const { fromColumnId, toColumnId, taskId, fromIndex } = details;
    let { toIndex } = details;

    const fromCol = columns.value.find((c) => c._id === fromColumnId);
    const toCol = columns.value.find((c) => c._id === toColumnId);
    if (!fromCol || !toCol) return;

    // No-op guard: same column and no real movement
    if (
        fromCol === toCol &&
        (toIndex === fromIndex || toIndex === fromIndex + 1)
    ) {
        return;
    }

    // Remove from source
    if (fromIndex < 0 || fromIndex >= fromCol.tasks.length) return;
    const [item] = fromCol.tasks.splice(fromIndex, 1);
    if (!item || String(item._id) !== String(taskId)) return;

    // Adjust index if same column and inserting lower
    if (fromCol === toCol && toIndex > fromIndex) {
        toIndex -= 1;
    }

    // Clamp safety
    if (toIndex < 0) toIndex = 0;
    if (toIndex > toCol.tasks.length) toIndex = toCol.tasks.length;

    // Insert at destination
    toCol.tasks.splice(toIndex, 0, item);

    // Update column ID and name if column changed
    if (fromCol !== toCol) {
        item.columnId = toCol._id;
        item.columnName = toCol.name;
    }

    // Save to database
    try {
        const response = await apiClient.patch(`/api/tasks/${item._id}/column`, {
            columnId: toCol._id,
            columnName: toCol.name,
        });
        
        if (!response.success) {
            console.error('Failed to update task column:', response.error);
            // Revert the move on error
            toCol.tasks.splice(toIndex, 1);
            fromCol.tasks.splice(fromIndex, 0, item);
            item.columnId = fromCol._id;
            item.columnName = fromCol.name;
        } else {
            console.log("✅ Task column updated successfully");
        }
    } catch (error) {
        console.error('Error updating task column:', error);
        // Revert the move on error
        toCol.tasks.splice(toIndex, 1);
        fromCol.tasks.splice(fromIndex, 0, item);
        item.columnId = fromCol._id;
        item.columnName = fromCol.name;
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
                const tokenParts = token.split(".");
                if (tokenParts[1]) {
                    const payload = JSON.parse(atob(tokenParts[1])) as any;
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

// Handle task created - reload workspace tasks
const handleTaskCreated = async () => {
    // Reload workspace to refresh tasks
    if (workspace.value?.columns) {
        const sortedColumns = (workspace.value.columns || []).sort(
            (a: any, b: any) => a.position - b.position,
        );
        await loadWorkspaceTasks(sortedColumns);
    }
};

// Handle task click - open edit modal
const handleTaskClick = (task: any) => {
    selectedTask.value = task as Task;
    showEditTaskModal.value = true;
};

// Handle close edit modal
const handleCloseEditModal = () => {
    showEditTaskModal.value = false;
    selectedTask.value = null;
};

// Handle task updated - reload tasks
const handleTaskUpdated = async () => {
    if (workspace.value?.columns) {
        const sortedColumns = (workspace.value.columns || []).sort(
            (a: any, b: any) => a.position - b.position,
        );
        await loadWorkspaceTasks(sortedColumns);
    }
};

// Handle task deleted - reload tasks 
const handleTaskDeleted = async () => {
    if (workspace.value?.columns) {
        const sortedColumns = (workspace.value.columns || []).sort(
            (a: any, b: any) => a.position - b.position,
        );
        await loadWorkspaceTasks(sortedColumns);
    }
};

// Load workspace on mount
onMounted(() => {
    loadWorkspace();
});
</script>
