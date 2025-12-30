<template>
  <div v-if="isAdmin" class="relative" ref="root">
    <button
      @click="toggle"
      @keydown.enter.prevent="toggle"
      :aria-expanded="open.toString()"
      aria-haspopup="menu"
      class="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 transition-colors text-sm"
      title="Admin"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v4M6 6v4M18 6v4M3 12h18M6 18v-4M18 18v-4M12 22v-4"></path>
      </svg>
      <span class="hidden sm:inline">Admin</span>
      <svg :class="['w-3 h-3 ml-1 transition-transform', open ? 'rotate-180' : 'rotate-0']" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clip-rule="evenodd"/>
      </svg>
    </button>

    <transition name="fade-scale">
      <div
        v-if="open"
        class="absolute right-0 mt-2 w-48 bg-secondary rounded-lg shadow-lg border border-white/10 z-50 overflow-hidden"
        role="menu"
        aria-label="Admin menu"
      >
        <ul class="py-1">
          <li>
            <button @click="navigate('/admin/users')" class="w-full text-left px-4 py-2 hover:bg-white/5 text-sm">Users</button>
          </li>
<!--          <li>-->
<!--            <button @click="navigate('/admin/users/stats')" class="w-full text-left px-4 py-2 hover:bg-white/5 text-sm">Stats</button>-->
<!--          </li>-->
<!--          <li>-->
<!--            <button @click="navigate('/admin/settings')" class="w-full text-left px-4 py-2 hover:bg-white/5 text-sm">Settings</button>-->
<!--          </li>-->
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/composables/useAuthStore'

const authStore = useAuthStore()
const user = authStore.user
const router = useRouter()

const open = ref(false)
const root = ref<HTMLElement | null>(null)

const isAdmin = computed(() => !!user.value && user.value.role === 'admin')

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

async function navigate(path: string) {
  close()
  try {
    await router.push(path)
  } catch (err) {
  }
}

function onClickOutside(e: MouseEvent) {
  const el = root.value
  if (!el) return
  if (!(e.target instanceof Node)) return
  if (!el.contains(e.target)) {
    close()
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  document.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
  document.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.fade-scale-enter-active {
  transition: all 150ms cubic-bezier(.2,.8,.2,1);
}
.fade-scale-leave-active {
  transition: all 100ms cubic-bezier(.2,.8,.2,1);
}
.fade-scale-enter-from {
  opacity: 0;
  transform: scale(.96);
}
.fade-scale-enter-to {
  opacity: 1;
  transform: scale(1);
}
.fade-scale-leave-from {
  opacity: 1;
  transform: scale(1);
}
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(.96);
}
</style>
