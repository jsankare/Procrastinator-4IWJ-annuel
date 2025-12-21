<template>
  <div class="min-h-screen flex items-center justify-center p-2 sm:p-6 bg-primary text-text">
    <div class="w-full max-w-md rounded-xl bg-secondary p-4 sm:p-8 border border-white/10 shadow-lg">
      <h1 class="text-xl sm:text-2xl font-bold mb-6 text-center">Réinitialiser le mot de passe</h1>
      
      <div v-if="isLoading" class="text-center py-8">
        <p class="text-white/70">Vérification du lien...</p>
      </div>

      <form v-else-if="isValidLink" @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block mb-2 text-sm text-white/80" for="password">Nouveau mot de passe</label>
          <input 
            id="password" 
            v-model="password"
            type="password" 
            class="w-full rounded-md bg-primary border border-white/10 px-3 py-2 text-text placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent" 
            placeholder="••••••••" 
            required
          />
          <p class="text-xs text-white/50 mt-2">Au moins 8 caractères, 1 majuscule, 1 minuscule et 1 chiffre</p>
        </div>

        <div>
          <label class="block mb-2 text-sm text-white/80" for="confirmPassword">Confirmer le mot de passe</label>
          <input 
            id="confirmPassword" 
            v-model="confirmPassword"
            type="password" 
            class="w-full rounded-md bg-primary border border-white/10 px-3 py-2 text-text placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent" 
            placeholder="••••••••" 
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
          :disabled="isSubmitting || !password || !confirmPassword"
          class="w-full rounded-md bg-accent text-secondary font-medium py-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? 'Réinitialisation...' : 'Réinitialiser le mot de passe' }}
        </button>
      </form>

      <div v-else class="text-center py-8">
        <p class="text-red-400 mb-4">{{ error || 'Lien de réinitialisation invalide ou expiré' }}</p>
        <NuxtLink 
          to="/forgot-password" 
          class="inline-block px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-secondary font-medium transition-colors"
        >
          Demander un nouveau lien
        </NuxtLink>
      </div>

      <p class="mt-4 text-center text-xs sm:text-sm text-white/70">
        Retourner sur la page de <NuxtLink to="/login" class="text-accent hover:underline">connexion</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { authApi } from '~/composables/useAuth';

useHead({ title: 'Reset Password' })

definePageMeta({
  layout: 'auth'
})

const route = useRoute();
const router = useRouter();

const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const success = ref('');
const isLoading = ref(true);
const isSubmitting = ref(false);
const isValidLink = ref(false);

const token = ref('');
const userId = ref('');

onMounted(() => {
  // Get token and userId from URL params
  token.value = route.query.token as string;
  userId.value = route.query.userId as string;

  if (!token.value || !userId.value) {
    error.value = 'Lien de réinitialisation invalide';
    isValidLink.value = false;
  } else {
    // In a real app, you would verify the token on the backend here
    // For now, we just validate that both are present
    isValidLink.value = true;
  }

  isLoading.value = false;
});

async function onSubmit() {
  error.value = '';
  success.value = '';

  // Validate passwords match
  if (password.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas';
    return;
  }

  // Validate password format
  if (password.value.length < 8) {
    error.value = 'Le mot de passe doit contenir au moins 8 caractères';
    return;
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password.value)) {
    error.value = 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await authApi.resetPassword(userId.value, token.value, password.value);
    
    if (response.success) {
      success.value = 'Mot de passe réinitialisé avec succès ! Redirection en cours...';
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      error.value = response.error || 'Erreur lors de la réinitialisation du mot de passe';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue';
  } finally {
    isSubmitting.value = false;
  }
}
</script>
