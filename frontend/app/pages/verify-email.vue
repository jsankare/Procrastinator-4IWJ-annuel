<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-primary text-text">
    <div class="max-w-md w-full">
      <div class="rounded-lg border border-white/10 bg-secondary p-8 shadow-lg">
        <!-- En cours de vérification -->
        <div v-if="isVerifying" class="text-center">
          <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center">
            <svg class="animate-spin w-8 h-8 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold mb-2">Vérification en cours...</h1>
          <p class="text-text/60">Merci de patienter pendant que nous vérifions votre email.</p>
        </div>

        <!-- Succès -->
        <div v-else-if="verificationSuccess" class="text-center">
          <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg class="w-8 h-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold mb-2 text-green-500">Email vérifié !</h1>
          <p class="text-text/60 mb-6">Votre adresse email a été vérifiée avec succès.</p>
          <button @click="redirectToLogin" class="w-full rounded-md bg-accent text-secondary font-medium py-2 hover:opacity-90 cursor-pointer">
            Se connecter
          </button>
        </div>

        <!-- Erreur -->
        <div v-else-if="verificationError" class="text-center">
          <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold mb-2 text-red-500">Erreur de vérification</h1>
          <p class="text-text/60 mb-6">{{ errorMessage }}</p>
          <div class="space-y-3">
            <button @click="resendVerification" :disabled="isResending" class="w-full rounded-md bg-accent text-secondary font-medium py-2 hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isResending ? 'Envoi en cours...' : 'Renvoyer l\'email de vérification' }}
            </button>
            <button @click="redirectToLogin" class="w-full rounded-md border border-white/10 bg-transparent text-text font-medium py-2 hover:bg-white/5 cursor-pointer">
              Retour à la connexion
            </button>
          </div>
        </div>

        <!-- Pas de token -->
        <div v-else class="text-center">
          <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <svg class="w-8 h-8 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold mb-2">Token manquant</h1>
          <p class="text-text/60 mb-6">Aucun token de vérification trouvé dans l'URL.</p>
          <button @click="redirectToLogin" class="w-full rounded-md bg-accent text-secondary font-medium py-2 hover:opacity-90 cursor-pointer">
            Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '~/composables/useAuth'

definePageMeta({
  layout: 'auth'
})

const route = useRoute()
const router = useRouter()

const isVerifying = ref(false)
const verificationSuccess = ref(false)
const verificationError = ref(false)
const errorMessage = ref('')
const isResending = ref(false)

const verifyEmail = async () => {
  const token = route.query.token as string
  
  if (!token) {
    return
  }

  isVerifying.value = true
  
  try {
    const response = await authApi.verifyEmail(token)
    
    if (response.success) {
      verificationSuccess.value = true
    } else {
      verificationError.value = true
      errorMessage.value = response.error || 'Une erreur est survenue lors de la vérification.'
    }
  } catch (error) {
    verificationError.value = true
    errorMessage.value = 'Impossible de vérifier votre email. Le lien est peut-être expiré.'
  } finally {
    isVerifying.value = false
  }
}

const resendVerification = async () => {
  isResending.value = true
  // TODO: Implémenter l'API pour renvoyer l'email de vérification
  setTimeout(() => {
    isResending.value = false
    alert('Email de vérification renvoyé ! Veuillez vérifier votre boîte mail.')
  }, 2000)
}

const redirectToLogin = () => {
  router.push('/login')
}

onMounted(() => {
  verifyEmail()
})
</script>
