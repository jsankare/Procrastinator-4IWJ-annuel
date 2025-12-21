<template>
  <div class="min-h-screen flex items-center justify-center p-2 sm:p-6 bg-primary text-text">
    <div class="w-full max-w-md rounded-xl bg-secondary p-4 sm:p-8 border border-white/10 shadow-lg">
      <h1 class="text-xl sm:text-2xl font-bold mb-6 text-center">Créer mon compte</h1>
      
      <!-- Error message -->
      <div v-if="errorMessage" class="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
        {{ errorMessage }}
      </div>

      <!-- Success message -->
      <div v-if="successMessage" class="mb-4 p-4 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-3 animate-fade-in">
        <svg class="animate-spin h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ successMessage }}</span>
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
const isLoading = ref(false)

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  // Validation
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Les mots de passe ne correspondent pas'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Le mot de passe doit contenir au moins 6 caractères'
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
      successMessage.value = 'Compte créé avec succès!'
      setTimeout(() => {
        router.push('/login')
      }, 1500)
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