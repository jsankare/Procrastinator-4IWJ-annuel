import { ref, computed } from 'vue'

const setupData = ref<{
  secret: string
  qrCode: string
  backupCodes: string[]
} | null>(null)

const isLoading = ref(false)
const error = ref<string | null>(null)

// Base URL pour l'auth service via Traefik
const AUTH_SERVICE_URL = 'http://localhost:85/api/auth'

export const useTwoFactor = () => {
  // Setup 2FA - génère secret et QR code
  const setupTwoFactor = async (userId: string) => {
    isLoading.value = true
    error.value = null
    try {
      console.log('[2FA] Setting up 2FA for user:', userId)
      const response = await fetch(`${AUTH_SERVICE_URL}/setup-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      console.log('[2FA] Setup response status:', response.status)
      if (!response.ok) {
        const errData = await response.json()
        console.error('[2FA] Setup error:', errData)
        throw new Error('Failed to setup 2FA')
      }

      const data = await response.json()
      console.log('[2FA] Setup success, got QR code')
      setupData.value = data.data
      return data.data
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
      const response = await fetch(`${AUTH_SERVICE_URL}/enable-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, secret, token, backupCodes }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to enable 2FA')
      }

      // Ne pas effacer setupData ici - on en a besoin pour afficher les codes de sauvegarde
      // setupData.value = null
      return await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Verify 2FA token during login
  const verifyTwoFactorToken = async (userId: string, token: string) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Invalid 2FA token')
      }

      return await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Disable 2FA
  const disableTwoFactor = async (userId: string, password: string) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/disable-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to disable 2FA')
      }

      return await response.json()
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
    disableTwoFactor,
    clearSetupData,
    clearError,
  }
}
