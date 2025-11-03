<script setup lang="ts">
useHead({ title: 'Login' })

// comme ça pour fixer le layout
definePageMeta({
  layout: 'auth'
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-primary text-text">
    <div class="w-full max-w-md rounded-xl bg-secondary p-8 border border-white/10 shadow-lg">
      <h1 class="text-2xl font-bold mb-6">Se connecter</h1>
      <form class="space-y-4">
        <div>
          <label class="block mb-2 text-sm text-white/80" for="email">Email</label>
          <input id="email" type="email" class="w-full rounded-md bg-primary border border-white/10 px-3 py-2 text-text placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="mon@mail.com" />
        </div>
        <div>
          <label class="block mb-2 text-sm text-white/80" for="password">Password</label>
          <input id="password" type="password" class="w-full rounded-md bg-primary border border-white/10 px-3 py-2 text-text placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="••••••••" />
        </div>
        <button type="submit" class="w-full rounded-md bg-accent text-secondary font-medium py-2 hover:opacity-90">Me connecter</button>
      </form>

      <p class="mt-4 text-center text-sm text-white/70">
        Pas encore de compte ? <NuxtLink to="/" class="text-accent hover:underline">Accueil</NuxtLink>
      </p>
    </div>
  </div>
</template>
