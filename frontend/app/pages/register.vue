<script setup lang="ts">
useHead({ title: 'Register' })

definePageMeta({
  layout: 'auth'
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-primary text-text">
    <div class="w-full max-w-md rounded-xl bg-secondary p-8 border border-white/10 shadow-lg">
      <h1 class="text-2xl font-bold mb-6">Créer mon compte</h1>
      <form class="space-y-4">
        <div>
          <label class="block mb-2 text-sm text-white/80" for="firstName">Prénom</label>
          <input id="firstName" type="text" class="w-full rounded-md bg-primary border border-white/10 px-3 py-2 text-text placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="John" />
        </div>
        <div>
          <label class="block mb-2 text-sm text-white/80" for="lastName">Nom</label>
          <input id="lastName" type="text" class="w-full rounded-md bg-primary border border-white/10 px-3 py-2 text-text placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Doe" />
        </div>
        <div>
          <label class="block mb-2 text-sm text-white/80" for="email">Email</label>
          <input id="email" type="email" class="w-full rounded-md bg-primary border border-white/10 px-3 py-2 text-text placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="mon@mail.com" />
        </div>
        <div>
          <label class="block mb-2 text-sm text-white/80" for="password">Mot de passe</label>
          <input id="password" type="password" class="w-full rounded-md bg-primary border border-white/10 px-3 py-2 text-text placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="••••••••" />
        </div>
        <div>
          <label class="block mb-2 text-sm text-white/80" for="confirm-password">Confirmation du mot de passe</label>
          <input id="confirm-password" type="password" class="w-full rounded-md bg-primary border border-white/10 px-3 py-2 text-text placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="••••••••" />
        </div>
        <button type="submit" class="w-full rounded-md bg-accent text-secondary font-medium py-2 hover:opacity-90 cursor-pointer ">Créer mon compte</button>
      </form>

      <p class="mt-4 text-center text-sm text-white/70">
        déjà un compte ? <NuxtLink to="/login" class="text-accent hover:underline">se connecter</NuxtLink>
      </p>
    </div>
  </div>
</template>
