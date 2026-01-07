<template>
    <div class="flex flex-col gap-4 w-full">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold">Mes Tâches</h2>
            <div class="flex items-center gap-4">
                <div class="text-sm text-white/70">
                    {{ tasks.length }} tâche{{ tasks.length > 1 ? "s" : "" }}
                </div>
            </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex items-center justify-center py-8">
            <div class="text-white/70">Chargement des tâches...</div>
        </div>

        <!-- Task Statistics -->
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            <!-- Dynamic Stats based on active columns -->
            <div v-for="column in columns" :key="column.id"
                class="bg-secondary/40 rounded-lg p-3 border border-white/10 text-center">
                <div class="text-lg font-bold" :style="{ color: column.color }">
                    {{ column.tasks.length }}
                </div>
                <div class="text-xs text-white/70">{{ column.name }}</div>
            </div>

            <!-- Overdue Stat (Always visible) -->
            <div class="bg-secondary/40 rounded-lg p-3 border border-white/10 text-center">
                <div class="text-lg font-bold text-red-500">
                    {{ taskStats.overdue }}
                </div>
                <div class="text-xs text-white/70">En retard</div>
            </div>
        </div>

        <!-- Personal Columns -->
        <div class="flex gap-4 overflow-x-auto pb-6 custom-scrollbar" style="min-height: 350px">
            <div v-for="column in columns" :key="column.id"
                class="shrink-0 w-80 bg-secondary/60 rounded-xl p-4 border border-white/10 flex flex-col"
                :style="{ borderTopColor: column.color, borderTopWidth: '3px' }">
                <h3 class="text-lg font-semibold mb-3 flex items-center justify-between">
                    <span class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: column.color }"></div>
                        {{ column.name }}
                    </span>
                    <span class="text-xs text-white/40 font-normal">{{
                        column.tasks.length
                    }}</span>
                </h3>

                <div class="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[70vh] pr-1 custom-scrollbar">
                    <div v-for="task in column.tasks" :key="task._id || task.id"
                        class="bg-primary/60 rounded-lg p-3 border border-white/10 hover:border-accent/40 transition-colors">
                        <div class="flex items-start justify-between mb-2">
                            <h4 class="font-medium text-sm leading-5">
                                {{ task.title }}
                            </h4>
                            <span class="text-xs px-2 py-1 rounded" :class="{
                                'bg-green-500/20 text-green-400':
                                    task.priority === 'low',
                                'bg-yellow-500/20 text-yellow-400':
                                    task.priority === 'medium',
                                'bg-red-500/20 text-red-400':
                                    task.priority === 'high',
                            }">
                                {{
                                    task.priority === "low"
                                        ? "Faible"
                                        : task.priority === "medium"
                                            ? "Moyen"
                                            : "Élevé"
                                }}
                            </span>
                        </div>

                        <p class="text-xs text-white/70 mb-3 line-clamp-2">
                            {{ task.description }}
                        </p>

                        <div class="flex items-center justify-between text-xs">
                            <div class="flex items-center gap-2 text-white/50">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2"
                                    viewBox="0 0 24 24">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                {{ formatDate(task.dueDate) }}
                            </div>

                            <div v-if="task.workspaceId" class="text-accent/70 text-xs">
                                {{ getWorkspaceName(task.workspaceId) }}
                            </div>
                        </div>

                        <!-- Overdue indicator -->
                        <div v-if="isOverdue(task)" class="mt-2 flex items-center gap-1 text-red-400 text-xs">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            En retard
                        </div>
                    </div>

                    <p v-if="!column.tasks.length" class="text-white/40 text-sm italic mt-2 text-center">
                        Aucune tâche
                    </p>
                </div>
            </div>
        </div>

        <!-- Create Task Modal -->
        <CreateTaskModal
            :is-open="showCreateModal"
            @close="showCreateModal = false"
            @created="handleTaskCreated"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated, watch } from "vue";
import { apiClient } from "~/utils/api";
import CreateTaskModal from "~/components/tasks/CreateTaskModal.vue";
import { useRoute } from "vue-router";
import { useAuthStore } from '~/composables/useAuthStore';

const route = useRoute();
const authStore = useAuthStore();

// Reactive data
const workspaces = ref<any[]>([]);
const tasks = ref<any[]>([]);
const loading = ref(false);
const showCreateModal = ref(false);

// Column configurations
const COLUMN_CONFIGS: Record<string, string> = {
    "À faire": "#64748b",
    "En cours": "#f59e0b",
    "En révision": "#8b5cf6",
    "Terminé": "#10b981",
    "Bloqué": "#ef4444",
};

// Load user's workspaces and tasks from real API
const loadPersonalTasks = async () => {
    try {
        loading.value = true;
        
        // Load workspaces
        try {
            const wsResponse = await apiClient.get("/api/workspaces/");
            if (wsResponse.success) {
                workspaces.value = (wsResponse.data as any)?.workspaces || [];
            }
        } catch (err) {
            console.error("Error loading workspaces:", err);
            workspaces.value = [];
        }

        // Load all tasks assigned to the current user
        try {
            const tasksResponse = await apiClient.get("/api/tasks");
            console.log("Full Tasks API response:", tasksResponse);
            console.log("Response success:", tasksResponse.success);
            console.log("Response data:", tasksResponse.data);
            console.log("Response data type:", typeof tasksResponse.data);
            
            if (tasksResponse.success && tasksResponse.data) {
                let extractedTasks: any[] = [];
                
                // Try different ways to extract tasks
                if (Array.isArray(tasksResponse.data)) {
                    // data is directly an array
                    extractedTasks = tasksResponse.data;
                } else if (Array.isArray((tasksResponse.data as any)?.tasks)) {
                    // data.tasks is an array
                    extractedTasks = (tasksResponse.data as any).tasks;
                    console.log("data.tasks is an array with length:", extractedTasks.length);
                } else if (typeof tasksResponse.data === 'object') {
                    // data is an object, try to find the tasks array
                    console.log("Data is object, keys:", Object.keys(tasksResponse.data));
                    console.log("data.tasks value:", (tasksResponse.data as any).tasks);
                    console.log("data.tasks type:", typeof (tasksResponse.data as any).tasks);
                    console.log("data.tasks is Array?:", Array.isArray((tasksResponse.data as any).tasks));
                    
                    // Check common property names
                    const possibleKeys = ['tasks', 'data', 'items', 'results'];
                    for (const key of possibleKeys) {
                        const value = (tasksResponse.data as any)[key];
                        console.log(`Checking key "${key}":`, value, "isArray:", Array.isArray(value));
                        
                        if (Array.isArray(value)) {
                            extractedTasks = value;
                            console.log(`Found tasks in property: ${key}`);
                            break;
                        }
                    }
                }
                    
                console.log("Extracted tasks:", extractedTasks);
                console.log("Extracted tasks length:", extractedTasks.length);
                console.log("Extracted tasks type:", Array.isArray(extractedTasks) ? "Array" : typeof extractedTasks);
                
                // Ensure we have an array
                if (!Array.isArray(extractedTasks)) {
                    console.error("Extracted tasks is not an array!", extractedTasks);
                    extractedTasks = [];
                }
                
                tasks.value = extractedTasks;
                console.log("Tasks assigned to ref:", tasks.value);
                console.log("Tasks ref length:", tasks.value.length);
            } else {
                console.error("Failed to load tasks:", tasksResponse.error);
                tasks.value = [];
            }
        } catch (err) {
            console.error("Error loading tasks:", err);
            tasks.value = [];
        }
    } catch (error) {
        console.error("Error loading personal tasks:", error);
    } finally {
        loading.value = false;
    }
};

// Organize tasks into columns based on their columnName
const columns = computed(() => {
    // console.log("Computing columns from tasks:", tasks.value);
    
    if (!tasks.value || tasks.value.length === 0) {
        // console.log("No tasks to organize");
        return [];
    }
    
    // Get unique column names
    const columnNames = [...new Set(tasks.value.map((task: any) => task.columnName))];
    // console.log("Unique column names:", columnNames);
    
    // Create columns with tasks
    const cols = columnNames.map((columnName: any) => {
        const columnTasks = tasks.value.filter((task: any) => task.columnName === columnName);
        // console.log(`Column "${columnName}" has ${columnTasks.length} tasks:`, columnTasks);
        
        return {
            id: String(columnName).toLowerCase().replace(/\s+/g, "-"),
            name: columnName,
            color: (COLUMN_CONFIGS as any)[columnName] || "#6b7280",
            tasks: columnTasks,
        };
    });
    
    // console.log("Created columns:", cols);
    
    // Sort columns by priority
    const columnOrder = ["À faire", "En cours", "En révision", "Terminé", "Bloqué"];
    
    const sortedCols = cols.sort((a, b) => {
        const aIndex = columnOrder.indexOf(a.name);
        const bIndex = columnOrder.indexOf(b.name);
        
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        
        return a.name.localeCompare(b.name);
    });
    
    // console.log("Sorted columns:", sortedCols);
    return sortedCols;
});

// Task statistics - Calculated from tasks
const taskStats = computed(() => {
    const today = new Date().toISOString().split("T")[0];
    const overdueCount = tasks.value ? tasks.value.filter((t: any) => {
        return (
            t.dueDate < today &&
            !t.columnName?.toLowerCase().includes("terminé")
        );
    }).length : 0;

    return {
        overdue: overdueCount,
        total: tasks.value ? tasks.value.length : 0
    };
});

// Utility functions
const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Demain";
    if (diffDays === -1) return "Hier";
    if (diffDays > 0) return `Dans ${diffDays}j`;
    return `Il y a ${Math.abs(diffDays)}j`;
};

const isOverdue = (task: any) => {
    if (task.columnName?.toLowerCase().includes("terminé")) return false;
    if (!task.dueDate) return false;
    const today = new Date().toISOString().split("T")[0];
    return task.dueDate < today;
};

const getWorkspaceName = (workspaceId: string) => {
    const workspace = workspaces.value.find((ws) => ws._id === workspaceId);
    return workspace ? workspace.name : "Workspace";
};

// Handle task created - reload tasks
const handleTaskCreated = async () => {
    showCreateModal.value = false;
    await loadPersonalTasks();
};

// Load tasks on mount
onMounted(() => {
    loadPersonalTasks();
});

// Reload tasks when component is activated (navigating back to this page)
onActivated(() => {
    loadPersonalTasks();
});

// Watch route changes to reload tasks when navigating to home
watch(() => route.path, (newPath) => {
    if (newPath === '/' || newPath === '/home') {
        loadPersonalTasks();
    }
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px; /* Ajout pour le scroll horizontal */
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>
