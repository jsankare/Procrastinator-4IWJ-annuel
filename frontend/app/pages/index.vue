<script setup lang="ts">
useHead({ title: 'Accueil' })
</script>

<template >
  <section class="space-y-6 bg-primary min-h-screen text-text">
    <h1 class="text-3xl font-bold">Procrastinator</h1>
    <p class="text-white/80 max-w-prose">
      Cette page a le layout de base avec la top navbar
    </p>

    <div class="grid gap-4 sm:grid-cols-2">
      <div class="rounded-lg border border-white/10 bg-secondary p-6">
        <h2 class="mb-2 text-xl font-semibold">Card</h2>
        <p class="text-white/70">blabla bla</p>
      </div>
      <div class="rounded-lg border border-white/10 bg-secondary p-6">
        <h2 class="mb-2 text-xl font-semibold">Card avec le layout pour l'auth</h2>
        <p class="text-white/70">blabla bnla laalka</p>
        <NuxtLink to="/login" class="mt-3 inline-block rounded-md bg-accent px-4 py-2 font-medium text-secondary hover:opacity-90">Login</NuxtLink>
      </div>
    </div>
  </section>
</template>
