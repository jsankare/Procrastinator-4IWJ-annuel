<template>
  <div class="min-h-screen flex items-center justify-center p-2 sm:p-6 bg-primary text-text">
    <div class="w-full max-w-md rounded-xl bg-secondary p-4 sm:p-8 border border-white/10 shadow-lg">
      <h1 class="text-xl sm:text-2xl font-bold mb-6 text-center">Créer mon compte</h1>
      
      <!-- Error message -->
      <div v-if="errorMessage" class="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
        {{ errorMessage }}
      </div>

      <!-- Success message -->
      <div v-if="successMessage" class="mb-4 p-4 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="font-semibold mb-1">{{ successMessage }}</p>
            <p class="text-xs text-green-300">Un email de vérification a été envoyé à votre adresse. Veuillez vérifier votre boîte mail avant de vous connecter.</p>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block mb-2 text-sm text-white/80" for="username">Nom d'utilisateur</label>
          <input 
            id="username" 
            v-model="username"
            type="text" 
            required
            :disabled="isLoading"
            class="w-full rounded-md bg-primary border border-white/10 px-3 py-2 text-text placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50" 
            placeholder="johndoe" 
          />
        </div>
        <div>
          <label class="block mb-2 text-sm text-white/80" for="firstName">Prénom</label>
          <input 
            id="firstName" 
            v-model="firstName"
            type="text" 
            required
            :disabled="isLoading"
            class="w-full rounded-md bg-primary border border-white/10 px-3 py-2 text-text placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50" 
            placeholder="John" 
          />
        </div>
        <div>
          <label class="block mb-2 text-sm text-white/80" for="lastName">Nom</label>
          <input 
            id="lastName" 
            v-model="lastName"
            type="text" 
            required
            :disabled="isLoading"
            class="w-full rounded-md bg-primary border border-white/10 px-3 py-2 text-text placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50" 
            placeholder="Doe" 
          />
        </div>
        <div>
          <label class="block mb-2 text-sm text-white/80" for="email">Email</label>
          <input 
            id="email" 
            v-model="email"
            type="email" 
            required
            :disabled="isLoading"
            class="w-full rounded-md bg-primary border border-white/10 px-3 py-2 text-text placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50" 
            placeholder="mon@mail.com" 
          />
        </div>
        <div>
          <label class="block mb-2 text-sm text-white/80" for="password">Mot de passe</label>
          <input 
            id="password" 
            v-model="password"
            type="password" 
            required
            :disabled="isLoading"
            class="w-full rounded-md bg-primary border border-white/10 px-3 py-2 text-text placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50" 
            placeholder="••••••••" 
          />
          <p class="mt-1 text-xs text-white/60">Au moins 8 caractères avec une minuscule, une majuscule et un chiffre</p>
        </div>
        <div>
          <label class="block mb-2 text-sm text-white/80" for="confirm-password">Confirmation du mot de passe</label>
          <input 
            id="confirm-password" 
            v-model="confirmPassword"
            type="password" 
            required
            :disabled="isLoading"
            class="w-full rounded-md bg-primary border border-white/10 px-3 py-2 text-text placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50" 
            placeholder="••••••••" 
          />
        </div>
        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full rounded-md bg-accent text-secondary font-medium py-2 hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Création...' : 'Créer mon compte' }}
        </button>
      </form>

      <p class="mt-4 text-center text-xs sm:text-sm text-white/70">
        Déjà un compte ? <NuxtLink to="/login" class="text-accent hover:underline">Se connecter</NuxtLink>
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/composables/useAuthStore'

useHead({ title: 'Inscription' })

definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
const router = useRouter()

// Initialize auth store
onMounted(() => {
  authStore.init()
})

const username = ref('')
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const errors = ref<Record<string, string>>({})

useHead({
  title: 'Inscription - Procrastinator',
  meta: [
    { name: 'description', content: 'Créez votre compte Procrastinator gratuitement et commencez à gérer vos tâches efficacement.' },
    { property: 'og:title', content: 'Inscription - Procrastinator' },
  ],
})

const isLoading = ref(false)

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  // Validation
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Les mots de passe ne correspondent pas'
    return
  }

  if (password.value.length < 8) {
    errorMessage.value = 'Le mot de passe doit contenir au moins 8 caractères'
    return
  }

  // Validation du format du mot de passe
  const hasLowercase = /[a-z]/.test(password.value)
  const hasUppercase = /[A-Z]/.test(password.value)
  const hasNumber = /[0-9]/.test(password.value)

  if (!hasLowercase || !hasUppercase || !hasNumber) {
    errorMessage.value = 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
    return
  }

  isLoading.value = true

  try {
    const result = await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value,
      firstName: firstName.value,
      lastName: lastName.value
    })

    if (result.success) {
      // Ne pas garder l'utilisateur connecté - il doit d'abord vérifier son email
      authStore.logout()
      
      successMessage.value = 'Compte créé avec succès !'
      
      // Redirection vers login après 4 secondes (temps de lire le message)
      setTimeout(() => {
        router.push('/login')
      }, 4000)
    } else {
      errorMessage.value = result.error || 'Erreur lors de l\'inscription'
    }
  } catch (error) {
    errorMessage.value = 'Une erreur est survenue lors de l\'inscription'
  } finally {
    isLoading.value = false
  }
}
</script>