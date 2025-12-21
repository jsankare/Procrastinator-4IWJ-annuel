<template>
  <div class="min-h-screen bg-primary text-text">
    <nav class="sticky lg:top-2.5 z-50 bg-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-secondary/80 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:rounded-4xl border border-white/10">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-3">
          <div class="h-8 w-8 rounded-md bg-accent flex items-center justify-center font-bold text-secondary">P</div>
          <span class="text-lg font-semibold">Procrastinator</span>
        </NuxtLink>

        <div class="hidden md:flex items-center gap-6">
          <NuxtLink to="/" class="hover:text-accent transition-colors">Home</NuxtLink>
          <NuxtLink to="/workspaces" class="hover:text-accent transition-colors">Workspaces</NuxtLink>
          <NuxtLink to="/profile" class="hover:text-accent transition-colors">Profil</NuxtLink>
          <div v-if="user" class="flex items-center gap-3">
            <span class="text-sm text-text/80">{{ user.username }}</span>
            <button @click="handleLogout" class="hover:text-accent transition-colors">Déconnexion</button>
          </div>
          <NuxtLink v-else to="/login" class="hover:text-accent transition-colors">Se connecter</NuxtLink>
        </div>

        <button class="md:hidden flex items-center justify-center w-10 h-10 rounded-md hover:bg-white/10" @click="menuOpen = !menuOpen">
          <svg
              v-if="!menuOpen"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-6 h-6"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-6 h-6"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
      >
        <div v-if="menuOpen" class="md:hidden px-4 pb-4 flex flex-col gap-3 text-base bg-secondary/95 backdrop-blur lg:rounded-b-3xl border-t border-white/10">
          <NuxtLink to="/" class="hover:text-accent transition-colors" @click="menuOpen = false">Home</NuxtLink>
          <NuxtLink to="/workspaces" class="hover:text-accent transition-colors" @click="menuOpen = false">Workspaces</NuxtLink>
          <NuxtLink to="/profile" class="hover:text-accent transition-colors" @click="menuOpen = false">Profil</NuxtLink>
          <div v-if="user" class="flex items-center gap-3">
            <span class="text-sm text-text/80">{{ user.username }}</span>
            <button @click="handleLogout" class="hover:text-accent transition-colors">Déconnexion</button>
          </div>
          <NuxtLink v-else to="/login" class="hover:text-accent transition-colors" @click="menuOpen = false">Se connecter</NuxtLink>
        </div>
      </transition>
    </nav>

    <!-- Page -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useAuthStore } from '~/composables/useAuthStore'
  import { useRouter } from 'vue-router'

  const menuOpen = ref(false)
  const router = useRouter()
  const authStore = useAuthStore()
  const user = authStore.user

  onMounted(() => {
    authStore.init()
  })

  const handleLogout = async () => {
    menuOpen.value = false
    await authStore.logout()
    if (router.currentRoute.value.path !== '/login') {
      router.push('/login')
    }
  }
</script>
