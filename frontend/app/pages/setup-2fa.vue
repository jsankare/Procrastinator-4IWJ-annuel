<template>
  <div class="min-h-screen bg-primary text-text">
    <div class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink to="/profile" class="text-accent hover:text-accent/80 text-sm font-medium flex items-center gap-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 19l-7-7 7-7"></path>
          </svg>
          Retour au profil
        </NuxtLink>
        <h1 class="text-3xl font-bold">Configuration de la double authentification</h1>
        <p class="text-text/60 mt-2">Sécurisez votre compte avec Google Authenticator, Microsoft Authenticator ou Authy</p>
      </div>

      <div class="space-y-8">
        <!-- Step 1: Download app -->
        <div class="rounded-lg border border-white/10 bg-secondary p-6">
          <div class="flex items-start gap-4">
            <div class="shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-accent/20">
                <span class="text-lg font-bold text-accent">1</span>
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold mb-2">Téléchargez une application d'authentification</h3>
              <p class="text-text/70 mb-4">Téléchargez l'une de ces applications sur votre téléphone :</p>
              <div class="flex flex-wrap gap-3">
                <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" 
                   target="_blank" rel="noopener noreferrer"
                   class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors">
                  Google Authenticator
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.microsoft.authenticator" 
                   target="_blank" rel="noopener noreferrer"
                   class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors">
                  Microsoft Authenticator
                </a>
                <a href="https://authy.com/download/" 
                   target="_blank" rel="noopener noreferrer"
                   class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors">
                  Authy
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Scan QR Code -->
        <div v-if="!showVerification" class="rounded-lg border border-white/10 bg-secondary p-6">
          <div class="flex items-start gap-4">
            <div class="shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-accent/20">
                <span class="text-lg font-bold text-accent">2</span>
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold mb-4">Scannez le code QR</h3>
              
              <div v-if="!setupData" class="space-y-4">
                <p class="text-text/70">Cliquez sur le bouton ci-dessous pour générer votre code QR.</p>
                <button
                  @click="generateQRCode"
                  :disabled="isLoading || !isInitialized"
                  class="px-6 py-2 rounded-lg bg-accent hover:bg-accent/90 text-secondary font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :title="!isInitialized ? 'Chargement du profil...' : ''"
                >
                  {{ isLoading ? 'Génération...' : !isInitialized ? 'Chargement...' : 'Générer le code QR' }}
                </button>
              </div>

              <div v-else class="space-y-4">
                <!-- QR Code -->
                <div class="flex justify-center p-6 bg-white/5 rounded-lg">
                  <img :src="setupData.qrCode" :alt="'QR Code'" class="w-64 h-64" />
                </div>

                <!-- Secret Key (backup) -->
                <div class="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p class="text-sm text-text/60 mb-2">Clé secrète (à conserver en lieu sûr) :</p>
                  <div class="flex items-center gap-2">
                    <code class="flex-1 font-mono text-sm break-all text-accent">{{ setupData.secret }}</code>
                    <button
                      @click="copyToClipboard(setupData.secret)"
                      class="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      :title="copyMessage"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Action -->
                <button
                  @click="showVerification = true"
                  class="w-full px-6 py-2 rounded-lg bg-accent hover:bg-accent/90 text-secondary font-medium transition-colors"
                >
                  J'ai scanné le code → Vérifier
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Verify code -->
        <div v-if="showVerification && setupData" class="rounded-lg border border-white/10 bg-secondary p-6">
          <div class="flex items-start gap-4">
            <div class="shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-accent/20">
                <span class="text-lg font-bold text-accent">3</span>
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold mb-4">Entrez le code de vérification</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Code à 6 chiffres</label>
                  <input
                    v-model="verificationCode"
                    type="text"
                    inputmode="numeric"
                    placeholder="000000"
                    maxlength="6"
                    class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-accent outline-none transition-colors text-center text-2xl tracking-widest font-mono"
                  />
                </div>

                <div v-if="error" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {{ error }}
                </div>

                <button
                  @click="confirmEnableTwoFactor"
                  :disabled="verificationCode.length !== 6 || isLoading"
                  class="w-full px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isLoading ? 'Vérification...' : 'Vérifier et activer' }}
                </button>

                <button
                  @click="cancelSetup"
                  class="w-full px-6 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-text font-medium transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: Backup codes -->
        <div v-if="showBackupCodes && setupData" class="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-6">
          <div class="flex items-start gap-4">
            <div class="shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-yellow-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold mb-2 text-yellow-200">Codes de sauvegarde</h3>
              <p class="text-yellow-200/70 mb-4">Sauvegardez ces codes dans un endroit sûr. Ils peuvent être utilisés pour accéder à votre compte si vous perdez votre téléphone.</p>
              
              <div class="grid grid-cols-2 gap-2 mb-4 p-4 rounded-lg bg-white/5 border border-white/10">
                <div v-for="(code, index) in setupData.backupCodes" :key="index" class="font-mono text-sm text-text/80">
                  {{ code }}
                </div>
              </div>

              <div class="flex gap-3">
                <button
                  @click="copyBackupCodes"
                  class="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
                >
                  📋 Copier les codes
                </button>
                <button
                  @click="finalizeTwoFactor"
                  class="flex-1 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
                >
                  ✓ J'ai sauvegardé les codes
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Success -->
        <div v-if="showSuccess" class="rounded-lg border border-green-500/20 bg-green-500/5 p-6">
          <div class="flex items-start gap-4">
            <div class="shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-green-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-green-500 mb-2">Double authentification activée !</h3>
              <p class="text-green-200 mb-4">Votre compte est maintenant protégé par la double authentification.</p>
              <NuxtLink
                to="/profile"
                class="inline-block px-6 py-2 rounded-lg bg-accent hover:bg-accent/90 text-secondary font-medium transition-colors"
              >
                Retour au profil
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/composables/useAuthStore'
import { useTwoFactor } from '~/composables/useTwoFactor'
import { authApi } from '~/composables/useAuth'

definePageMeta({
  layout: 'default',
})

const router = useRouter()
const authStore = useAuthStore()
const { setupData, isLoading, error, setupTwoFactor, enableTwoFactor: enableTwoFactorAPI, clearSetupData } = useTwoFactor()

const showVerification = ref(false)
const showBackupCodes = ref(false)
const showSuccess = ref(false)
const verificationCode = ref('')
const copyMessage = ref('Copier')
const userId = ref<string | null>(null)
const isInitialized = ref(false)

// Initialize
onMounted(async () => {
  try {
    console.log('[2FA Setup] Initializing authStore...')
    await authStore.init()
    console.log('[2FA Setup] authStore initialized, user:', authStore.user.value?._id)
    
    if (authStore.user.value) {
      userId.value = authStore.user.value._id
      isInitialized.value = true
      console.log('[2FA Setup] userId set to:', userId.value)
    } else {
      console.warn('[2FA Setup] No user found, redirecting to login')
      router.push('/login')
    }
  } catch (err) {
    console.error('[2FA Setup] Error initializing:', err)
    router.push('/login')
  }
})

const generateQRCode = async () => {
  if (!userId.value) {
    console.error('User ID not available')
    return
  }
  
  console.log('[2FA Setup Page] Generating QR code for user:', userId.value)
  try {
    console.log('[2FA Setup Page] Calling setupTwoFactor...')
    const result = await setupTwoFactor(userId.value)
    console.log('[2FA Setup Page] QR code generated, result:', result)
    // Ne pas mettre showVerification = true ici, laisser l'utilisateur cliquer sur le bouton
  } catch (err) {
    console.error('[2FA Setup Page] Error generating QR code:', err)
  }
}

const confirmEnableTwoFactor = async () => {
  if (!userId.value || verificationCode.value.length !== 6 || !setupData.value) return

  try {
    await enableTwoFactorAPI(
      userId.value,
      setupData.value.secret,
      verificationCode.value,
      setupData.value.backupCodes
    )
    showVerification.value = false
    showBackupCodes.value = true
  } catch (err) {
    console.error('Error enabling 2FA:', err)
  }
}

const finalizeTwoFactor = async () => {
  showBackupCodes.value = false
  showSuccess.value = true
  
  try {
    // First, initialize the auth store to load the token from localStorage
    authStore.init()
    
    // Get the token
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      console.error('[2FA] No token found in localStorage')
      return
    }
    
    console.log('[2FA] Found token, fetching user data...')
    
    // Fetch the latest user data from the backend
    const response = await fetch('http://localhost:85/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      const userData = data.data || data
      
      console.log('[2FA] Backend response:', data)
      console.log('[2FA] User data:', userData)
      
      // Update the store with the fresh user data
      authStore.user = userData
      
      // Save to localStorage
      if (process.client) {
        localStorage.setItem('auth_user', JSON.stringify(userData))
      }
      
      console.log('[2FA] User data refreshed, isTwoFactorEnabled:', userData.isTwoFactorEnabled)
    } else {
      console.error('[2FA] Failed to refresh user:', response.status, await response.text())
    }
  } catch (err) {
    console.error('[2FA] Error refreshing user data:', err)
  }
  
  // Clear the setup data
  clearSetupData()
  
  // Redirect to profile after 3 seconds
  setTimeout(() => {
    router.push('/profile')
  }, 3000)
}

const cancelSetup = () => {
  showVerification.value = false
  verificationCode.value = ''
  clearSetupData()
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    copyMessage.value = 'Copié!'
    setTimeout(() => {
      copyMessage.value = 'Copier'
    }, 2000)
  } catch (err) {
    console.error('Error copying to clipboard:', err)
  }
}

const copyBackupCodes = async () => {
  if (!setupData.value) return
  try {
    const text = setupData.value.backupCodes.join('\n')
    await navigator.clipboard.writeText(text)
    alert('Codes de sauvegarde copiés!')
  } catch (err) {
    console.error('Error copying backup codes:', err)
  }
}
</script>
