import { ref } from "vue";
import { apiClient } from "~/utils/api";

export interface AdminWorkspace {
    _id: string;
    name: string;
    description?: string;
    inviteCode: string;
    ownerId: string;
    members: Array<{
        userId: string;
        username?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        role: "owner" | "admin" | "member";
        joinedAt: Date;
        isActive: boolean;
    }>;
    columns: Array<{
        _id: string;
        name: string;
        color: string;
        position: number;
        createdAt: Date;
        isActive: boolean;
    }>;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}

export interface WorkspaceStats {
    total: number;
    active: number;
    inactive: number;
    totalMembers: number;
    averageMembersPerWorkspace: number;
    totalColumns: number;
    averageColumnsPerWorkspace: number;
    createdToday: number;
    createdThisWeek: number;
    createdThisMonth: number;
}

export interface AdminWorkspacesResponse {
    workspaces: AdminWorkspace[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const useAdminWorkspaces = () => {
    const loading = ref(false);
    const error = ref<string | null>(null);

    /**
     * Get all workspaces with pagination
     */
    const getAllWorkspaces = async (
        page: number = 1,
        limit: number = 10,
    ): Promise<AdminWorkspacesResponse | null> => {
        try {
            loading.value = true;
            error.value = null;

            const response = await apiClient.get(
                "/api/workspaces/admin/workspaces",
                {
                    params: { page, limit },
                },
            );

            if (response.success && response.data) {
                return response.data;
            } else {
                error.value = response.error || "Failed to fetch workspaces";
                return null;
            }
        } catch (err) {
            error.value =
                err instanceof Error ? err.message : "An error occurred";
            return null;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Get workspace by ID
     */
    const getWorkspaceById = async (
        id: string,
    ): Promise<AdminWorkspace | null> => {
        try {
            loading.value = true;
            error.value = null;

            const response = await apiClient.get(
                `/api/workspaces/admin/workspaces/${id}`,
            );

            if (response.success && response.data?.workspace) {
                return response.data.workspace;
            } else {
                error.value = response.error || "Workspace not found";
                return null;
            }
        } catch (err) {
            error.value =
                err instanceof Error ? err.message : "An error occurred";
            return null;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Update workspace
     */
    const updateWorkspace = async (
        id: string,
        updateData: Partial<
            Pick<AdminWorkspace, "name" | "description" | "isActive">
        >,
    ): Promise<AdminWorkspace | null> => {
        try {
            loading.value = true;
            error.value = null;

            const response = await apiClient.put(
                `/api/workspaces/admin/workspaces/${id}`,
                updateData,
            );

            if (response.success && response.data?.workspace) {
                return response.data.workspace;
            } else {
                error.value = response.error || "Failed to update workspace";
                return null;
            }
        } catch (err) {
            error.value =
                err instanceof Error ? err.message : "An error occurred";
            return null;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Delete workspace (soft delete)
     */
    const deleteWorkspace = async (id: string): Promise<boolean> => {
        try {
            loading.value = true;
            error.value = null;

            const response = await apiClient.delete(
                `/api/workspaces/admin/workspaces/${id}`,
            );

            if (response.success) {
                return true;
            } else {
                error.value = response.error || "Failed to delete workspace";
                return false;
            }
        } catch (err) {
            error.value =
                err instanceof Error ? err.message : "An error occurred";
            return false;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Hard delete workspace (permanent deletion)
     */
    const hardDeleteWorkspace = async (id: string): Promise<boolean> => {
        try {
            loading.value = true;
            error.value = null;

            const response = await apiClient.delete(
                `/api/workspaces/admin/workspaces/${id}/hard`,
            );

            if (response.success) {
                return true;
            } else {
                error.value =
                    response.error || "Failed to permanently delete workspace";
                return false;
            }
        } catch (err) {
            error.value =
                err instanceof Error ? err.message : "An error occurred";
            return false;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Get workspace statistics
     */
    const getWorkspaceStats = async (): Promise<WorkspaceStats | null> => {
        try {
            loading.value = true;
            error.value = null;

            const response = await apiClient.get("/api/workspaces/admin/stats");

            if (response.success && response.data) {
                return response.data;
            } else {
                error.value = response.error || "Failed to fetch statistics";
                return null;
            }
        } catch (err) {
            error.value =
                err instanceof Error ? err.message : "An error occurred";
            return null;
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        error,
        getAllWorkspaces,
        getWorkspaceById,
        updateWorkspace,
        deleteWorkspace,
        hardDeleteWorkspace,
        getWorkspaceStats,
    };
};

export type UseAdminWorkspaces = ReturnType<typeof useAdminWorkspaces>;
