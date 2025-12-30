import { ref, computed } from 'vue'
import { authApi, type User, type LoginCredentials, type RegisterData } from './useAuth'

// Global state
const user = ref<User | null>(null)
const token = ref<string | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

export const useAuthStore = () => {
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const currentUser = computed(() => user.value)

  // Initialize from localStorage
  const init = () => {
    if (import.meta.client) {
      const savedToken = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('auth_user')

      if (savedToken && savedUser) {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
      }
    }
  }

  // Login
  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.login(credentials)

      if (response.success) {
        // Check if 2FA is required
        if (response.data?.requiresTwoFactor) {
          return {
            success: true,
            requiresTwoFactor: true,
            userId: response.data.userId
          }
        }

        // Normal login flow
        if (response.data) {
          user.value = response.data.user
          token.value = response.data.token

          // Save to localStorage
          if (import.meta.client) {
            localStorage.setItem('auth_token', response.data.token)
            localStorage.setItem('auth_user', JSON.stringify(response.data.user))
            if (response.data.refreshToken) {
              localStorage.setItem('refresh_token', response.data.refreshToken)
            }
          }
        }

        return { success: true };
      } else {
        error.value = response.error || 'Erreur de connexion'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inattendue'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Register
  const register = async (data: RegisterData) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.register(data)
      
      if (response.success) {
        // Registration successful - no auto-login, user needs to verify email
        // Only save user data if token is provided (shouldn't be for email verification flow)
        if (response.data?.token) {
          user.value = response.data.user
          token.value = response.data.token
          
          // Save to localStorage
          if (import.meta.client) {
            localStorage.setItem('auth_token', response.data.token)
            localStorage.setItem('auth_user', JSON.stringify(response.data.user))
            if (response.data.refreshToken) {
              localStorage.setItem('refresh_token', response.data.refreshToken)
            }
          }
        }
        
        return { success: true }
      } else {
        error.value = response.error || 'Erreur lors de l\'inscription'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inattendue'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Logout
  const logout = async () => {
    isLoading.value = true
    
    // Clear state
    user.value = null
    token.value = null
    error.value = null
    
    // Clear localStorage
    if (process.client) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('refresh_token')
    }
    
    isLoading.value = false
  }

  // Fetch current user
  const fetchCurrentUser = async () => {
    if (!token.value) return

    isLoading.value = true
    
    try {
      const response = await authApi.getCurrentUser()
      
      if (response.success && response.data) {
        user.value = response.data
        
        if (import.meta.client) {
          localStorage.setItem('auth_user', JSON.stringify(response.data))
        }
      } else {
        // Token might be invalid, logout
        await logout()
      }
    } catch (err) {
      console.error('Fetch user error:', err)
      await logout()
    } finally {
      isLoading.value = false
    }
  }

  // Update profile
  const updateProfile = async (updates: Partial<User>) => {
    if (!user.value) return { success: false, error: 'Non authentifié' }

    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.updateProfile(user.value._id, updates)
      
      if (response.success && response.data) {
        user.value = response.data
        
        if (import.meta.client) {
          localStorage.setItem('auth_user', JSON.stringify(response.data))
        }
        
        return { success: true }
      } else {
        error.value = response.error || 'Erreur de mise à jour'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inattendue'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    user: currentUser,
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    init,
    login,
    register,
    logout,
    fetchCurrentUser,
    updateProfile,
  }
}
