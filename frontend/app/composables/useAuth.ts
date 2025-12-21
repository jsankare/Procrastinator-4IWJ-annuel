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
}

// Auth API Service
export const authApi = {
  // Login
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/api/auth/login', credentials)
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
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/api/auth/reset-password', { token, newPassword })
  },

  // Update profile
  async updateProfile(userId: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient.patch<User>(`/api/auth/users/${userId}`, data)
  },
}
