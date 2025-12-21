<template>
  <div class="min-h-screen flex items-center justify-center p-2 sm:p-6 bg-primary text-text">
    <div class="w-full max-w-md rounded-xl bg-secondary p-4 sm:p-8 border border-white/10 shadow-lg">
      <h1 class="text-xl sm:text-2xl font-bold mb-6 text-center">Réinitialiser mon mot de passe</h1>
      <form class="space-y-4">
        <div>
          <label class="block mb-2 text-sm text-white/80" for="email">Email</label>
          <input id="email" type="email" class="w-full rounded-md bg-primary border border-white/10 px-3 py-2 text-text placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="mon@mail.com" />
        </div>
        <button type="submit" class="w-full rounded-md bg-accent text-secondary font-medium py-2 hover:opacity-90">Demander un nouveau mot de passe</button>
      </form>

      <p class="mt-4 text-center text-xs sm:text-sm text-white/70">
        Retourner sur la page de <NuxtLink to="/login" class="text-accent hover:underline">connexion</NuxtLink>
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
useHead({ title: 'Login' })

// comme ça pour fixer le layout spécifique
definePageMeta({
  layout: 'auth'
})
</script>