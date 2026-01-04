import { apiClient, type ApiResponse } from '~/utils/api'

// Types
export interface User {
  _id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  isEmailVerified: boolean
  isTwoFactorEnabled?: boolean
  createdAt: string
  updatedAt: string
  preferences?: {
    theme: string
    language: string
    notifications: {
      email: boolean
      push: boolean
    }
  }
  profile?: {
    avatar?: string
    bio?: string
    location?: string
    website?: string
  }
  avatar?: string
  points?: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
  requiresTwoFactor?: boolean
  tempToken?: string
  userId?: string
}

// Auth API Service
export const authApi = {
  // Login
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    // Handle 2FA requirement - check if data contains require2fa flag
    if (response.success && response.data && (response.data as any).require2fa) {
      return response; // Return as-is, data already contains require2fa, tempToken, userId
    }
    return response;
  },

  // Register
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/api/auth/register', data)
  },

  // Logout
  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/api/auth/logout')
  },

  // Get current user
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/api/auth/me')
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/api/auth/refresh', { refreshToken })
  },

  // Verify email
  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/api/auth/verify-email', { token })
  },

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/api/auth/resend-verification', { email })
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/api/auth/forgot-password', { email })
  },

  // Reset password
  async resetPassword(userId: string, token: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/api/auth/reset-password', { userId, token, newPassword })
  },

  // Update profile (admin)
  async updateProfile(
    userId: string,
    data: Partial<User>,
  ): Promise<ApiResponse<User>> {
    return apiClient.patch<User>(`/api/auth/users/${userId}`, data);
  },

  // Update my profile (current user)
  async updateMyProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient.put<User>("/api/auth/profile", data);
  },

  // Admin: list users with optional filters/pagination
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
    isEmailVerified?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<
    ApiResponse<{
      users: User[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>
  > {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.role) query.set("role", params.role);
    if (params?.isActive !== undefined)
      query.set("isActive", String(params.isActive));
    if (params?.isEmailVerified !== undefined)
      query.set("isEmailVerified", String(params.isEmailVerified));
    if (params?.sortBy) query.set("sortBy", params.sortBy);
    if (params?.sortOrder) query.set("sortOrder", params.sortOrder);
    const q = query.toString() ? `?${query.toString()}` : "";
    return apiClient.get(`/api/auth/users${q}`);
  },

  // Admin: get a single user by id
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`/api/auth/users/${userId}`);
  },

  // Admin: update user by id
  async updateUserById(
    userId: string,
    data: Partial<User>,
  ): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`/api/auth/users/${userId}`, data);
  },

  // Admin: delete user by id
  async deleteUserById(userId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/auth/users/${userId}`);
  },

  // Admin: get aggregated user stats
  async getUserStats(): Promise<ApiResponse<any>> {
    return apiClient.get("/api/auth/users/stats");
  },
};
