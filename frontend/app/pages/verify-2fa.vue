<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-primary text-text">
    <div class="max-w-md w-full">
      <div class="rounded-lg border border-white/10 bg-secondary p-8 shadow-lg">
        <div class="text-center mb-8">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold">Vérification en deux étapes</h1>
          <p class="text-text/60 mt-2 text-sm">Entrez le code de votre application d'authentification</p>
        </div>

        <form @submit.prevent="verifyToken" class="space-y-6">
          <!-- Code input -->
          <div>
            <label class="block text-sm font-medium mb-2">Code à 6 chiffres</label>
            <input
              v-model="verificationCode"
              type="text"
              inputmode="numeric"
              placeholder="000000"
              maxlength="6"
              autofocus
              class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-accent outline-none transition-colors text-center text-3xl tracking-widest font-mono"
              @keyup.enter="verifyToken"
            />
          </div>

          <!-- Tabs: TOTP / Backup -->
          <div class="flex gap-2 border-b border-white/10">
            <button
              type="button"
              @click="activeTab = 'totp'"
              :class="[
                'flex-1 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'totp'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text/60 hover:text-text'
              ]"
            >
              Code d'application
            </button>
            <button
              type="button"
              @click="activeTab = 'backup'"
              :class="[
                'flex-1 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'backup'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text/60 hover:text-text'
              ]"
            >
              Code de sauvegarde
            </button>
          </div>

          <!-- Tab content -->
          <div v-show="activeTab === 'totp'" class="text-sm text-text/60">
            Entrez le code à 6 chiffres de votre application d'authentification
          </div>
          <div v-show="activeTab === 'backup'" class="text-sm text-text/60">
            Entrez l'un de vos codes de sauvegarde à 8 caractères
            <input
              v-if="activeTab === 'backup'"
              v-model="verificationCode"
              type="text"
              placeholder="XXXXXXXX"
              maxlength="8"
              class="w-full mt-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-accent outline-none transition-colors text-center text-lg tracking-widest font-mono"
              @keyup.enter="verifyToken"
            />
          </div>

          <!-- Error message -->
          <div v-if="error" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {{ error }}
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="(activeTab === 'totp' && verificationCode.length !== 6) || (activeTab === 'backup' && verificationCode.length !== 8) || isLoading"
            class="w-full px-4 py-2 rounded-lg bg-accent text-secondary font-medium hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Vérification...' : 'Vérifier' }}
          </button>

          <!-- Help link -->
          <div class="text-center">
            <NuxtLink to="/login" class="text-sm text-accent hover:text-accent/80">
              Retour à la connexion
            </NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/composables/useAuthStore'
import { useTwoFactor } from '~/composables/useTwoFactor'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { isLoading, error: twoFactorError, verifyTwoFactorToken, clearError } = useTwoFactor()

const verificationCode = ref('')
const activeTab = ref<'totp' | 'backup'>('totp')
const userId = ref<string>('')
const error = ref<string | null>(null)

onMounted(() => {
  // Check if userId is in session/route
  userId.value = route.query.userId as string || ''
  
  if (!userId.value) {
    router.push('/login')
  }
})

const verifyToken = async () => {
  if (!verificationCode.value || !userId.value) return

  error.value = null
  clearError()

  try {
    const response = await verifyTwoFactorToken(userId.value, verificationCode.value)
    
    if (response.success) {
      console.log('[2FA Verify] Response:', response)
      
      // Save token to localStorage with correct key
      const token = response.data.token
      const user = response.data.user
      
      if (process.client) {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_user', JSON.stringify(user))
        if (response.data.refreshToken) {
          localStorage.setItem('refresh_token', response.data.refreshToken)
        }
      }
      
      // Update auth store
      authStore.user = user
      authStore.init() // Reload from localStorage
      
      console.log('[2FA Verify] Redirecting to home...')
      
      // Redirect to home
      router.push('/')
    }
  } catch (err) {
    error.value = twoFactorError.value || 'Code invalide'
    console.error('[2FA Verify] Error:', err)
  }
}
</script>
