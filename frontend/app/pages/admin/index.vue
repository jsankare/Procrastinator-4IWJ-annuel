<template>
  <section class="min-h-screen flex items-center justify-center bg-primary text-text p-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold mb-2">Admin</h1>
      <p class="text-white/70 mb-4">Redirection vers le panneau des utilisateurs...</p>
      <NuxtLink to="/admin/users" class="px-4 py-2 rounded bg-accent text-secondary inline-block">Aller à /admin/users</NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  title: 'Admin'
})

const router = useRouter()

onMounted(() => {
  router.replace('/admin/users').catch(() => {
  })
})
</script>

<style scoped>
</style>
