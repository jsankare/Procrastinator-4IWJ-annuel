<template>
  <div class="min-h-screen flex items-center justify-center p-2 sm:p-6 bg-primary text-text">
    <div class="w-full max-w-md rounded-xl bg-secondary p-4 sm:p-8 border border-white/10 shadow-lg">
      <h1 class="text-xl sm:text-2xl font-bold mb-6 text-center">Réinitialiser mon mot de passe</h1>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block mb-2 text-sm text-white/80" for="email">Email</label>
          <input 
            id="email" 
            v-model="email"
            type="email" 
            class="w-full rounded-md bg-primary border border-white/10 px-3 py-2 text-text placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent" 
            placeholder="mon@mail.com" 
            required
          />
        </div>
        
        <div v-if="error" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {{ error }}
        </div>

        <div v-if="success" class="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          {{ success }}
        </div>
        
        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full rounded-md bg-accent text-secondary font-medium py-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Chargement...' : 'Demander un nouveau mot de passe' }}
        </button>
      </form>

      <p class="mt-4 text-center text-xs sm:text-sm text-white/70">
        Retourner sur la page de <NuxtLink to="/login" class="text-accent hover:underline">connexion</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { authApi } from '~/composables/useAuth';

useHead({ title: 'Forgot Password' })

definePageMeta({
  layout: 'auth'
})

const email = ref('');
const error = ref('');
const success = ref('');
const isLoading = ref(false);

async function onSubmit() {
  error.value = '';
  success.value = '';
  isLoading.value = true;

  try {
    const response = await authApi.requestPasswordReset(email.value);
    
    if (response.success) {
      success.value = 'Si un compte existe avec cet email, vous recevrez les instructions de réinitialisation.';
      email.value = '';
      setTimeout(() => {
        navigateTo('/login');
      }, 2000);
    } else {
      error.value = response.error || 'Une erreur est survenue';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue';
  } finally {
    isLoading.value = false;
  }
}
</script>