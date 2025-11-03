<template>
  <div class="min-h-screen bg-primary text-text">
    <!-- Navbar -->
    <nav class="sticky top-0 z-50 bg-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-secondary/80 border-b border-white/10">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-3">
          <div class="h-8 w-8 rounded-md bg-accent flex items-center justify-center font-bold text-secondary">
            P
          </div>
          <span class="text-lg font-semibold">Procrastinator</span>
        </NuxtLink>
        <div class="flex items-center gap-6">
          <NuxtLink to="/" class="hover:text-accent transition-colors">Home</NuxtLink>
          <NuxtLink to="/toto" class="hover:text-accent transition-colors">Toto</NuxtLink>
          <NuxtLink to="/login" class="hover:text-accent transition-colors">Login</NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Page -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <slot />
    </main>
  </div>
</template>
