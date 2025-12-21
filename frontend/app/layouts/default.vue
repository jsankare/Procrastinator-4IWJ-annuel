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
          
          <!-- État connecté -->
          <div v-if="user" class="flex items-center gap-3 pl-3 border-l border-white/10">
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
              <div class="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-semibold text-sm">
                {{ user.username.charAt(0).toUpperCase() }}
              </div>
              <span class="text-sm font-medium">{{ user.username }}</span>
            </div>
            <button 
              @click="handleLogout" 
              class="px-4 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200 text-sm font-medium flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Déconnexion
            </button>
          </div>
          
          <!-- État non connecté -->
          <NuxtLink 
            v-else 
            to="/login" 
            class="ml-3 px-5 py-2 rounded-lg bg-accent hover:bg-accent/90 text-secondary font-medium transition-all duration-200 flex items-center gap-2 shadow-lg shadow-accent/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            Se connecter
          </NuxtLink>
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
          <NuxtLink to="/" class="hover:text-accent transition-colors py-2" @click="menuOpen = false">Home</NuxtLink>
          <NuxtLink to="/workspaces" class="hover:text-accent transition-colors py-2" @click="menuOpen = false">Workspaces</NuxtLink>
          <NuxtLink to="/profile" class="hover:text-accent transition-colors py-2" @click="menuOpen = false">Profil</NuxtLink>
          
          <!-- État connecté mobile -->
          <div v-if="user" class="pt-3 border-t border-white/10 flex flex-col gap-3">
            <div class="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5">
              <div class="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-semibold">
                {{ user.username.charAt(0).toUpperCase() }}
              </div>
              <span class="font-medium">{{ user.username }}</span>
            </div>
            <button 
              @click="handleLogout" 
              class="w-full px-4 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200 font-medium flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Déconnexion
            </button>
          </div>
          
          <!-- État non connecté mobile -->
          <NuxtLink 
            v-else 
            to="/login" 
            class="mt-2 w-full px-5 py-3 rounded-lg bg-accent hover:bg-accent/90 text-secondary font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-accent/20" 
            @click="menuOpen = false"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            Se connecter
          </NuxtLink>
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
