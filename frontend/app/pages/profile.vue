<template>
  <section class="space-y-6 bg-primary min-h-screen text-text">
    <div
      class="relative flex flex-col items-center justify-center py-10 mb-6 bg-linear-to-r from-accent/30 to-secondary/30 rounded-b-3xl shadow-lg">
      <button @click="showEdit = true"
        class="absolute top-4 right-4 bg-accent text-secondary px-4 py-2 rounded-lg font-semibold shadow hover:bg-accent/80 transition-all flex items-center gap-2">
        Modifier
      </button>
      <label
        class="w-28 h-28 rounded-full overflow-hidden border-4 border-accent shadow-lg mb-4 cursor-pointer group relative"
        title="Changer l'avatar">
        <input type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
        <img :src="(user?.profile?.avatar) || user?.avatar || '/assets/icons/user.svg'" alt="Fallback Avatar"
          class="object-cover w-full h-full p-4" />
        <span
          class="absolute bottom-2 right-2 bg-accent text-secondary rounded-full p-1 shadow group-hover:scale-110 transition-transform">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="m3.99 16.854-1.314 3.504a.75.75 0 0 0 .966.965l3.503-1.314a3 3 0 0 0 1.068-.687L18.36 9.175s-.354-1.061-1.414-2.122c-1.06-1.06-2.122-1.414-2.122-1.414L4.677 15.786a3 3 0 0 0-.687 1.068zm12.249-12.63 1.383-1.383c.248-.248.579-.406.925-.348.487.08 1.232.322 1.934 1.025.703.703.945 1.447 1.025 1.934.058.346-.1.677-.348.925L19.774 7.76s-.353-1.06-1.414-2.12c-1.06-1.062-2.121-1.415-2.121-1.415z"
                fill="#000000"></path>
            </g>
          </svg>
        </span>
      </label>
      <h1 class="text-3xl font-bold tracking-tight">{{ user?.firstName }} {{ user?.lastName }}</h1>
      <p class="text-lg text-accent font-semibold">Niveau {{ getLevelFromPoints(user?.points) }}</p>
      <p v-if="user?.points" class="text-sm text-white/70">
        {{ user?.points }} pts • Prochain palier: {{ getNextLevelPoints(getLevelFromPoints(user?.points ?? 0) + 1) }}
        pts
      </p>
    </div>
    <div class="space-y-4">
      <h3>Statistiques</h3>
      <div class="grid gap-4 sm:grid-cols-3">
        <Card :icon="checkIcon" :title="user?.completedTasks" description="Tâches terminées" layout="side" icon-color="text-green-500" />
        <Card :icon="fireIcon" :title="user?.streak" description="Jours de streak" layout="side" icon-color="text-orange-600" />
        <Card :icon="starIcon" :title="user?.level" description="Niveau" layout="side" icon-color="text-yellow-400" />
      </div>
    </div>
    <div class="space-y-4">
      <h3>Hauts-faits</h3>
      <div class="mb-6">
        <BadgesGallery :user-badges="user?.badges" />
      </div>
    </div>
    <div class="rounded-lg border border-white/10 bg-secondary p-6 space-y-4">
      <h3>Paramètres</h3>

      <!-- 2FA Section -->
      <div class="space-y-4 border-t border-white/10 pt-4">
        <h4>Sécurité</h4>
        <div class="flex gap-4 justify-between items-center">
          <div>
            <p class="font-medium">Double authentification</p>
            <p class="text-sm text-text/60">Protégez votre compte avec une couche de sécurité supplémentaire</p>
          </div>
          <div class="flex gap-2">
            <NuxtLink v-if="!user?.isTwoFactorEnabled" to="/setup-2fa"
              class="px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-secondary font-medium transition-colors text-sm">
              Activer
            </NuxtLink>
            <button v-else @click="showDisable2FAModal = true"
              class="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-medium transition-colors text-sm">
              Désactiver
            </button>
            <span v-if="user?.isTwoFactorEnabled"
              class="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-medium text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
              </svg>
              Activée
            </span>
          </div>
        </div>
      </div>

      <div>
        <h4>Apparence</h4>
        <div class="flex gap-4 justify-between items-center">
          <p>Thème</p>
          <div class="flex gap-2">
            <button class="bg-accent text-secondary font-medium py-2 px-4 rounded-md cursor-pointer">Sombre</button>
            <button class="bg-white/10 text-white font-medium py-2 px-4 rounded-md ml-2 cursor-pointer">Clair</button>
            <button class="bg-white/10 text-white font-medium py-2 px-4 rounded-md ml-2 cursor-pointer">Système</button>
          </div>
        </div>
      </div>
    </div>
  </section>
  <EditProfileModal :show="showEdit" :user="user || undefined" @close="showEdit = false" @save="onSave" />
  <!-- ... -->
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/composables/useAuthStore';
import { useTwoFactor } from '~/composables/useTwoFactor';
import Card from "~/components/global/card.vue";
import EditProfileModal from "~/components/global/EditProfileModal.vue";
import BadgesGallery from "~/components/gamification/BadgesGallery.vue";
import fireIcon from "~/assets/icons/fire.svg";
import checkIcon from "~/assets/icons/check.svg";
import starIcon from "~/assets/icons/star.svg";
import { getLevelFromPoints, getNextLevelPoints } from "~/utils/levelSystem";

const authStore = useAuthStore();

const { isLoading: isTwoFactorLoading, disableTwoFactor } = useTwoFactor();

const user = computed(() => authStore.user.value);
const showEdit = ref(false);
const showDisable2FAModal = ref(false);
const showPassword = ref(false);
const disablePassword = ref('');
const disableError = ref('');
const isDisablingLoading = ref(false);

useHead({
  title: 'Mon Profil - Procrastinator',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

onMounted(async () => {
  await authStore.init();
  if (authStore.token?.value) {
    await authStore.fetchCurrentUser();
  }
});


async function onSave(newData: any) {
  try {
    const payload: any = {};
    if (newData.firstName !== undefined) payload.firstName = newData.firstName;
    if (newData.lastName !== undefined) payload.lastName = newData.lastName;
    
    if (newData.username && newData.username !== user.value?.username) {
        payload.username = newData.username;
    }
    if (newData.email && newData.email !== user.value?.email) {
        payload.email = newData.email;
    }
    
    if (newData.currentPassword && newData.newPassword) {
        payload.currentPassword = newData.currentPassword;
        payload.newPassword = newData.newPassword;
    }

    if (newData.avatar !== undefined) {
      const existingProfile = authStore.user.value?.profile || {};
      payload.profile = {
        ...existingProfile,
        avatar: newData.avatar,
      };
    }

    const result = await authStore.updateProfile(payload);

    if (!result || !result.success) {
      console.error('Failed to update profile', result?.error || result);
      return;
    }

    await authStore.fetchCurrentUser();
  } catch (err) {
    console.error('Error saving profile', err);
  } finally {
    showEdit.value = false;
  }
}

async function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (ev) => {
    const avatarData = ev.target?.result as string;
    if (user.value) {
      user.value.avatar = avatarData;
      try {
        await authStore.updateProfile({ profile: { ...(authStore.user.value?.profile || {}), avatar: avatarData } });
        await authStore.fetchCurrentUser();
      } catch (err) {
        console.error('Failed to persist avatar', err);
      }
    }
  };
  reader.readAsDataURL(file);
}

async function confirmDisable2FA() {
  if (!user.value || !disablePassword.value) return;

  isDisablingLoading.value = true;
  disableError.value = '';

  try {
    const response = await disableTwoFactor(user.value._id, disablePassword.value);
    if (response.success) {
      authStore.user = (response as any).data.user;
      showDisable2FAModal.value = false;
      showPassword.value = false;
      disablePassword.value = '';
    }
  } catch (err) {
    disableError.value = err instanceof Error ? err.message : 'Erreur lors de la désactivation';
  } finally {
    isDisablingLoading.value = false;
  }
}
</script>
