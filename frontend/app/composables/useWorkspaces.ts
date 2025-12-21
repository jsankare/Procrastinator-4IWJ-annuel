import { ref } from 'vue'
import { apiClient, type ApiResponse } from '~/utils/api'

export interface Workspace {
  id: number | string
  _id?: number | string
  name: string
  description?: string
  visibility?: 'private' | 'public'
  members?: Array<string | number>
  inviteCode?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateWorkspacePayload {
  name: string
  description?: string
  visibility: 'private' | 'public'
}

export interface JoinWorkspacePayload {
  invite: string
}

export const useWorkspaces = () => {
  const workspaces = ref<Workspace[]>([])
  const currentWorkspace = ref<Workspace | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const normalizeWorkspace = (ws: any): Workspace => ({
    ...ws,
    id: ws?.id ?? ws?._id ?? ws?.code ?? ws?.inviteCode ?? ws?.name ?? 'unknown',
    inviteCode: ws?.inviteCode ?? ws?.code ?? '',
  })

  const fetchMyWorkspaces = async (): Promise<ApiResponse<Workspace[]>> => {
    isLoading.value = true
    error.value = null
    const res = await apiClient.get<Workspace[]>('/api/workspaces')
    if (res.success && Array.isArray(res.data)) {
      workspaces.value = res.data.map(normalizeWorkspace)
    } else {
      error.value = res.error || 'Impossible de récupérer les workspaces'
      workspaces.value = []
    }
    isLoading.value = false
    return res
  }

  const fetchWorkspaceById = async (id: string | number): Promise<ApiResponse<Workspace>> => {
    isLoading.value = true
    error.value = null
    const res = await apiClient.get<Workspace>(`/api/workspaces/${id}`)
    if (res.success && res.data) {
      currentWorkspace.value = normalizeWorkspace(res.data)
    } else {
      error.value = res.error || 'Workspace introuvable'
      currentWorkspace.value = null
    }
    isLoading.value = false
    return res
  }

  const createWorkspace = async (payload: CreateWorkspacePayload): Promise<ApiResponse<Workspace>> => {
    isLoading.value = true
    error.value = null
    const res = await apiClient.post<Workspace>('/api/workspaces', payload)
    if (!res.success) {
      error.value = res.error || 'Création du workspace échouée'
    } else if (res.data) {
      currentWorkspace.value = normalizeWorkspace(res.data)
    }
    isLoading.value = false
    return res
  }

  const joinWorkspace = async (payload: JoinWorkspacePayload): Promise<ApiResponse<Workspace>> => {
    isLoading.value = true
    error.value = null
    const res = await apiClient.post<Workspace>('/api/workspaces/join', payload)
    if (!res.success) {
      error.value = res.error || 'Échec de la jonction au workspace'
    } else if (res.data) {
      currentWorkspace.value = normalizeWorkspace(res.data)
    }
    isLoading.value = false
    return res
  }

  const leaveWorkspace = async (id: string | number): Promise<ApiResponse<null>> => {
    isLoading.value = true
    error.value = null
    const res = await apiClient.post<null>(`/api/workspaces/${id}/leave`, {})
    if (!res.success) {
      error.value = res.error || 'Impossible de quitter le workspace'
    } else {
      currentWorkspace.value = null
      await fetchMyWorkspaces()
    }
    isLoading.value = false
    return res
  }

  return {
    // state
    workspaces,
    currentWorkspace,
    isLoading,
    error,
    // actions
    fetchMyWorkspaces,
    fetchWorkspaceById,
    createWorkspace,
    joinWorkspace,
    leaveWorkspace,
  }
}
