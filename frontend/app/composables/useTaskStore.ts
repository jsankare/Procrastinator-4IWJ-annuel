import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '~/utils/api';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskStats } from '~/types/task';

export const useTaskStore = defineStore('task', () => {
    // State
    const tasks = ref<Task[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const stats = ref<TaskStats>({
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0,
        overdue: 0,
    });

    // Getters
    const tasksByWorkspace = computed(() => (workspaceId: string) => {
        return tasks.value.filter((task) => task.workspaceId === workspaceId);
    });

    const personalTasks = computed(() => {
        return tasks.value.filter((task) => !task.workspaceId);
    });

    // Actions
    const fetchTasks = async (workspaceId?: string) => {
        loading.value = true;
        error.value = null;

        try {
            const url = workspaceId
                ? `/api/tasks?workspaceId=${workspaceId}`
                : '/api/tasks';

            const response = await apiClient.get(url);

            if (response.success && response.data) {
                tasks.value = (response.data as any).tasks || [];
            } else {
                throw new Error(response.error || 'Failed to fetch tasks');
            }
        } catch (err: any) {
            error.value = err.message || 'Error fetching tasks';
            console.error('Error fetching tasks:', err);
            tasks.value = [];
        } finally {
            loading.value = false;
        }
    };

    const fetchTasksByWorkspace = async (workspaceId: string) => {
        loading.value = true;
        error.value = null;

        try {
            const response = await apiClient.get(`/api/tasks/workspace/${workspaceId}`);

            if (response.success && response.data) {
                const workspaceTasks = (response.data as any).tasks || [];
                // Update only the tasks for this workspace
                tasks.value = tasks.value.filter((t) => t.workspaceId !== workspaceId);
                tasks.value.push(...workspaceTasks);
            } else {
                throw new Error(response.error || 'Failed to fetch workspace tasks');
            }
        } catch (err: any) {
            error.value = err.message || 'Error fetching workspace tasks';
            console.error('Error fetching workspace tasks:', err);
        } finally {
            loading.value = false;
        }
    };

    const createTask = async (taskData: CreateTaskInput) => {
        loading.value = true;
        error.value = null;

        try {
            const response = await apiClient.post('/api/tasks', taskData);

            if (response.success && response.data) {
                const newTask = (response.data as any).task;
                tasks.value.unshift(newTask);
                return newTask;
            } else {
                throw new Error(response.error || 'Failed to create task');
            }
        } catch (err: any) {
            error.value = err.message || 'Error creating task';
            console.error('Error creating task:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const updateTask = async (taskId: string, updateData: UpdateTaskInput) => {
        loading.value = true;
        error.value = null;

        try {
            const response = await apiClient.put(`/api/tasks/${taskId}`, updateData);

            if (response.success && response.data) {
                const updatedTask = (response.data as any).task;
                const index = tasks.value.findIndex((t) => t._id === taskId);
                if (index !== -1) {
                    tasks.value[index] = updatedTask;
                }
                return updatedTask;
            } else {
                throw new Error(response.error || 'Failed to update task');
            }
        } catch (err: any) {
            error.value = err.message || 'Error updating task';
            console.error('Error updating task:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const updateTaskColumn = async (taskId: string, columnId: string, columnName: string) => {
        try {
            const response = await apiClient.patch(`/api/tasks/${taskId}/column`, {
                columnId,
                columnName,
            });

            if (response.success && response.data) {
                const updatedTask = (response.data as any).task;
                const index = tasks.value.findIndex((t) => t._id === taskId);
                if (index !== -1) {
                    tasks.value[index] = updatedTask;
                }
                return updatedTask;
            } else {
                throw new Error(response.error || 'Failed to update task column');
            }
        } catch (err: any) {
            error.value = err.message || 'Error updating task column';
            console.error('Error updating task column:', err);
            throw err;
        }
    };

    const deleteTask = async (taskId: string) => {
        loading.value = true;
        error.value = null;

        try {
            const response = await apiClient.delete(`/api/tasks/${taskId}`);

            if (response.success) {
                tasks.value = tasks.value.filter((t) => t._id !== taskId);
                return true;
            } else {
                throw new Error(response.error || 'Failed to delete task');
            }
        } catch (err: any) {
            error.value = err.message || 'Error deleting task';
            console.error('Error deleting task:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/api/tasks/stats');

            if (response.success && response.data) {
                stats.value = (response.data as any).stats;
            }
        } catch (err: any) {
            console.error('Error fetching task stats:', err);
        }
    };

    const clearTasks = () => {
        tasks.value = [];
        error.value = null;
    };

    const assignMember = async (taskId: string, userId: string) => {
        try {
            const response = await apiClient.post(`/api/tasks/${taskId}/members`, { userId });

            if (response.success && response.data) {
                const updatedTask = (response.data as any).task;
                const index = tasks.value.findIndex((t) => t._id === taskId);
                if (index !== -1) {
                    tasks.value[index] = updatedTask;
                }
                return updatedTask;
            } else {
                throw new Error(response.error || 'Failed to assign member');
            }
        } catch (err: any) {
            error.value = err.message || 'Error assigning member';
            console.error('Error assigning member:', err);
            throw err;
        }
    };

    const unassignMember = async (taskId: string, userId: string) => {
        try {
            const response = await apiClient.delete(`/api/tasks/${taskId}/members/${userId}`);

            if (response.success && response.data) {
                const updatedTask = (response.data as any).task;
                const index = tasks.value.findIndex((t) => t._id === taskId);
                if (index !== -1) {
                    tasks.value[index] = updatedTask;
                }
                return updatedTask;
            } else {
                throw new Error(response.error || 'Failed to unassign member');
            }
        } catch (err: any) {
            error.value = err.message || 'Error unassigning member';
            console.error('Error unassigning member:', err);
            throw err;
        }
    };


    return {
        // State
        tasks,
        loading,
        error,
        stats,
        // Getters
        tasksByWorkspace,
        personalTasks,
        // Actions
        fetchTasks,
        fetchTasksByWorkspace,
        createTask,
        updateTask,
        updateTaskColumn,
        deleteTask,
        fetchStats,
        clearTasks,
        assignMember,
        unassignMember,
    };
});
