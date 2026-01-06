<template>
    <div class="flex flex-col gap-4 w-full">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold">Mes Tâches</h2>
            <div class="flex items-center gap-4">
                <div class="text-sm text-white/70">
                    {{ tasks.length }} tâche{{ tasks.length > 1 ? "s" : "" }}
                </div>
                <button
                    @click="showCreateModal = true"
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
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex items-center justify-center py-8">
            <div class="text-white/70">Chargement des tâches...</div>
        </div>

        <!-- Task Statistics -->
        <div v-else class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            <div class="bg-secondary/40 rounded-lg p-3 border border-white/10 text-center">
                <div class="text-lg font-bold text-blue-400">
                    {{ taskStats.todo }}
                </div>
                <div class="text-xs text-white/70">À faire</div>
            </div>
            <div class="bg-secondary/40 rounded-lg p-3 border border-white/10 text-center">
                <div class="text-lg font-bold text-orange-400">
                    {{ taskStats.inProgress }}
                </div>
                <div class="text-xs text-white/70">En cours</div>
            </div>
            <div class="bg-secondary/40 rounded-lg p-3 border border-white/10 text-center">
                <div class="text-lg font-bold text-green-400">
                    {{ taskStats.completed }}
                </div>
                <div class="text-xs text-white/70">Terminé</div>
            </div>
            <div class="bg-secondary/40 rounded-lg p-3 border border-white/10 text-center">
                <div class="text-lg font-bold text-purple-400">
                    {{ taskStats.review }}
                </div>
                <div class="text-xs text-white/70">Révision</div>
            </div>
            <div class="bg-secondary/40 rounded-lg p-3 border border-white/10 text-center">
                <div class="text-lg font-bold text-red-400">
                    {{ taskStats.overdue }}
                </div>
                <div class="text-xs text-white/70">En retard</div>
            </div>
        </div>

        <!-- Personal Columns -->
        <div class="flex gap-4 overflow-x-auto pb-6" style="min-height: 350px">
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

                <div class="flex flex-col gap-3 flex-1">
                    <div v-for="task in column.tasks" :key="task.id"
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
import { ref, computed, onMounted } from "vue";
import { useTaskStore } from "~/composables/useTaskStore";
import type { Task } from "~/types/task";
import { organizeTasksIntoColumns, getTaskStats } from "~/utils/mockTasks";
import { apiClient } from "~/utils/api";
import CreateTaskModal from "~/components/tasks/CreateTaskModal.vue";

// Use task store
const taskStore = useTaskStore();

// Reactive data
const workspaces = ref<any[]>([]);
const loading = computed(() => taskStore.loading);
const tasks = computed(() => taskStore.tasks);
const showCreateModal = ref(false);

// Load user's workspaces and tasks from real API
const loadPersonalTasks = async () => {
    try {
        // Try to get user's workspaces
        try {
            const response = await apiClient.get("/api/workspaces/");
            if (response.success) {
                workspaces.value = response.data?.workspaces || [];
            }
        } catch (err) {
            console.error("Error loading workspaces:", err);
            workspaces.value = [];
        }

        // Fetch tasks from API
        await taskStore.fetchTasks();
    } catch (error) {
        console.error("Error loading personal tasks:", error);
    }
};

// Organize tasks into dynamic columns based on their designated columns
const columns = computed(() => {
    return organizeTasksIntoColumns(tasks.value);
});

// Task statistics
const taskStats = computed(() => getTaskStats(tasks.value));

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

const isOverdue = (task: MockTask) => {
    if (task.status.toLowerCase().includes("terminé")) return false;
    if (!task.dueDate) return false;
    const today = new Date().toISOString().split("T")[0];
    return today ? task.dueDate < today : false;
};

const getWorkspaceName = (workspaceId: string) => {
    const workspace = workspaces.value.find((ws) => ws._id === workspaceId);
    return workspace ? workspace.name : "Workspace";
};

// Load tasks on mount
onMounted(() => {
    loadPersonalTasks();
});
</script>
