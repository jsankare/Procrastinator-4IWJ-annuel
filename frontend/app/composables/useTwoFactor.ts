import { ref } from 'vue'
import { apiClient } from '~/utils/api';

const setupData = ref<{
  secret: string
  qrCode: string
  backupCodes: string[]
} | null>(null)

const isLoading = ref(false)
const error = ref<string | null>(null)

export const useTwoFactor = () => {
  // Setup 2FA - génère secret et QR code
  const setupTwoFactor = async (userId: string) => {
    isLoading.value = true
    error.value = null
    try {
      console.log('[2FA] Setting up 2FA for user:', userId)
      const response = await apiClient.post<{ secret: string; qrCode: string; backupCodes: string[] }>('/api/auth/2fa/generate')

      if (!response.success || !response.data) {
        throw new Error(response.error || response.message || 'Failed to setup 2FA')
      }

      console.log('[2FA] Setup success, got QR code')
      setupData.value = response.data
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('[2FA] Setup error:', error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Enable 2FA - valide le token et active
  const enableTwoFactor = async (
    userId: string,
    secret: string,
    token: string,
    backupCodes: string[]
  ) => {
    isLoading.value = true
    error.value = null
    try {
      // Note: Backend verification only needs token.
      const response = await apiClient.post('/api/auth/2fa/verify', { token })

      if (!response.success) {
        throw new Error(response.error || response.message || 'Failed to enable 2FA')
      }

      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Validate 2FA login with tempToken
  const validateLogin = async (tempToken: string, token: string) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.post<any>('/api/auth/2fa/validate-login', { tempToken, token })

      if (!response.success) {
        throw new Error(response.error || response.message || 'Invalid 2FA code')
      }

      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Verify 2FA token during settings verification
  const verifyTwoFactorToken = async (userId: string, token: string) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.post('/api/auth/2fa/verify', { token })

      if (!response.success) {
        throw new Error(response.error || response.message || 'Invalid 2FA token')
      }

      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const disableTwoFactor = async (userId: string, password: string): Promise<any> => {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.post('/api/auth/disable-2fa', { userId, password })

      if (!response.success) {
        throw new Error(response.error || response.message || 'Failed to disable 2FA')
      }

      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearSetupData = () => {
    setupData.value = null
  }

  const clearError = () => {
    error.value = null
  }

  return {
    setupData,
    isLoading,
    error,
    setupTwoFactor,
    enableTwoFactor,
    verifyTwoFactorToken,
    validateLogin,
    disableTwoFactor,
    clearSetupData,
    clearError,
  }
}
