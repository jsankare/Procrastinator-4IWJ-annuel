<template>
  <div class="min-h-screen flex items-center justify-center bg-primary text-text p-4">
    <div class="w-full max-w-md bg-secondary rounded-xl shadow-lg p-8 text-center">
        <h1 class="text-2xl font-bold mb-4">Vérification du changement</h1>
        
        <div v-if="loading" class="py-8">
            <div class="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Veuillez patienter...</p>
        </div>
        
        <div v-else-if="success" class="text-green-400 py-4">
             <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
             <p class="text-lg font-medium mb-2">Succès !</p>
             <p class="text-white/80 mb-6">{{ message }}</p>
             <NuxtLink to="/profile" class="inline-block px-6 py-2 bg-accent text-secondary rounded-lg font-bold hover:bg-accent/90 transition-colors">Retour au profil</NuxtLink>
        </div>
        
        <div v-else class="text-red-400 py-4">
             <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
             <p class="text-lg font-medium mb-2">Erreur</p>
             <p class="text-white/80 mb-6">{{ message }}</p>
             <NuxtLink to="/profile" class="text-white underline hover:text-accent transition-colors">Retour au profil</NuxtLink>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { apiClient } from '~/utils/api';

const route = useRoute();
const loading = ref(true);
const success = ref(false);
const message = ref('');

useHead({
  title: 'Vérification - Procrastinator',
});

onMounted(async () => {
   const { token, type } = route.query;
   
   if (!token || !type) {
       loading.value = false;
       success.value = false;
       message.value = 'Lien invalide (paramètres manquants).';
       return;
   }
   
   try {
       // Using apiClient directly or creating a specific method in useAuth?
       // Let's use apiClient directly as it's a one-off verification page
       const res: any = await apiClient.post('/api/auth/verify-change', { token, type });
       
       if (res.success) {
           success.value = true;
           message.value = res.message || 'Votre changement a été confirmé avec succès.';
       } else {
           throw new Error(res.message || 'Erreur lors de la vérification.');
       }
   } catch (err: any) {
       success.value = false;
       console.error(err);
       message.value = err.message || 'Le lien a expiré ou est invalide.';
   } finally {
       loading.value = false;
   }
});
</script>
