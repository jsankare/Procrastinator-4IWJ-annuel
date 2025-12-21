import { ref, computed } from 'vue'
import { apiClient, type ApiResponse } from '~/utils/api'

export type TaskStatus = 'plannifié' | 'en cours' | 'terminé'

export interface Task {
  id: number | string
  title: string
  description?: string
  dueDate?: string
  status?: TaskStatus
  workspaceId?: number | string
  assignedTo?: string | number
  user?: { firstName: string; lastName: string; avatar?: string } | null
}

export const useTasks = () => {
  const tasks = ref<Task[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const total = computed(() => tasks.value.length)
  const completed = computed(() => tasks.value.filter(t => (t.status || '').toLowerCase() === 'terminé').length)

  const fetchTasksForWorkspace = async (workspaceId: string | number): Promise<ApiResponse<Task[]>> => {
    isLoading.value = true
    error.value = null
    const res = await apiClient.get<Task[]>(`/api/tasks?workspaceId=${workspaceId}`)
    if (res.success && Array.isArray(res.data)) {
      tasks.value = res.data
    } else {
      error.value = res.error || 'Impossible de récupérer les tâches'
      tasks.value = []
    }
    isLoading.value = false
    return res
  }

  const fetchTasksForUser = async (userId: string | number): Promise<ApiResponse<Task[]>> => {
    isLoading.value = true
    error.value = null
    const res = await apiClient.get<Task[]>(`/api/tasks?assignedTo=${userId}`)
    if (res.success && Array.isArray(res.data)) {
      tasks.value = res.data
    } else {
      error.value = res.error || 'Impossible de récupérer les tâches'
      tasks.value = []
    }
    isLoading.value = false
    return res
  }

  const updateTaskStatus = async (taskId: string | number, status: TaskStatus): Promise<ApiResponse<Task>> => {
    const res = await apiClient.patch<Task>(`/api/tasks/${taskId}`, { status })
    if (res.success && res.data) {
      const idx = tasks.value.findIndex(t => String(t.id) === String(taskId))
      if (idx !== -1) tasks.value[idx] = res.data
    }
    return res
  }

  return {
    // state
    tasks,
    isLoading,
    error,
    total,
    completed,
    // actions
    fetchTasksForWorkspace,
    fetchTasksForUser,
    updateTaskStatus,
  }
}
