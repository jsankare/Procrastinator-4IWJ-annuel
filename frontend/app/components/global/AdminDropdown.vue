<template>
  <div
      v-if="isAdmin"
      ref="root"
      class="relative sm:relative static w-full sm:w-auto"
  >
    <hr class="md:hidden" />
    <button
        @click="toggle"
        @keydown.enter.prevent="toggle"
        :aria-expanded="open.toString()"
        aria-haspopup="menu"
        class="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-2 px-3 py-2 rounded-md hover:bg-white/5 transition-colors text-sm"
        title="Admin"
    >
      <span>Admin</span>
      <svg
          :class="[
                    'w-3 h-3 transition-transform',
                    open ? 'rotate-180' : 'rotate-0',
                ]"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
      >
        <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clip-rule="evenodd"
        />
      </svg>
    </button>

    <transition name="fade-scale">
      <div
          v-if="open"
          role="menu"
          aria-label="Admin menu"
          class="
                    z-50
                    sm:absolute sm:right-0 sm:mt-2
                    static mt-1
                    w-full sm:w-48
                    bg-secondary
                    sm:rounded-lg rounded-md
                    shadow-lg
                    border border-white/10
                    overflow-hidden
                "
      >
        <ul class="py-1">
          <li>
            <button
                @click="navigate('/admin/users')"
                class="w-full text-left px-4 py-2 hover:bg-white/5 text-sm"
            >
              Users
            </button>
          </li>
          <li>
            <button
                @click="navigate('/admin/workspaces')"
                class="w-full text-left px-4 py-2 hover:bg-white/5 text-sm"
            >
              Workspaces
            </button>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "~/composables/useAuthStore";

const authStore = useAuthStore();
const user = authStore.user;
const router = useRouter();

const open = ref(false);
const root = ref<HTMLElement | null>(null);

const isAdmin = computed(() => !!user.value && user.value.role === "admin");

function toggle() {
    open.value = !open.value;
}

function close() {
    open.value = false;
}

async function navigate(path: string) {
    close();
    try {
        await router.push(path);
    } catch (err) {}
}

function onClickOutside(e: MouseEvent) {
    const el = root.value;
    if (!el) return;
    if (!(e.target instanceof Node)) return;
    if (!el.contains(e.target)) {
        close();
    }
}

function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") close();
}

onMounted(() => {
    document.addEventListener("click", onClickOutside);
    document.addEventListener("keydown", onKey);
});

onBeforeUnmount(() => {
    document.removeEventListener("click", onClickOutside);
    document.removeEventListener("keydown", onKey);
});
</script>

<style scoped>
.fade-scale-enter-active {
    transition: all 150ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.fade-scale-leave-active {
    transition: all 100ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.fade-scale-enter-from {
    opacity: 0;
    transform: scale(0.96);
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
    transform: scale(0.96);
}
</style>
