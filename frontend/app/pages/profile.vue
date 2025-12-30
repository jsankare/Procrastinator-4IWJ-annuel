<template >
  <section class="space-y-6 bg-primary min-h-screen text-text">
    <div class="relative flex flex-col items-center justify-center py-10 mb-6 bg-linear-to-r from-accent/30 to-secondary/30 rounded-b-3xl shadow-lg">
      <button @click="showEdit = true" class="absolute top-4 right-4 bg-accent text-secondary px-4 py-2 rounded-lg font-semibold shadow hover:bg-accent/80 transition-all flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3zm0 0v3h3" /></svg>
        Modifier
      </button>
      <label class="w-28 h-28 rounded-full overflow-hidden border-4 border-accent shadow-lg mb-4 cursor-pointer group relative" title="Changer l'avatar">
        <input type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
        <img :src="(user?.profile?.avatar) || user?.avatar || '/assets/icons/user.svg'" alt="Avatar" class="object-cover w-full h-full" />
        <span class="absolute bottom-2 right-2 bg-accent text-secondary rounded-full p-1 shadow group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3zm0 0v3h3" /></svg>
        </span>
      </label>
      <h1 class="text-3xl font-bold tracking-tight">{{ user?.firstName }} {{ user?.lastName }}</h1>
      <p class="text-lg text-accent font-semibold">Niveau {{ getLevelFromPoints(user?.points) }}</p>
      <p v-if="user?.points" class="text-sm text-white/70">
        {{ user?.points }} pts • Prochain palier: {{ getNextLevelPoints(getLevelFromPoints(user?.points ?? 0) + 1) }} pts
      </p>
    </div>
    <div class="space-y-4">
      <h3>Statistiques</h3>
      <div class="grid gap-4 sm:grid-cols-3">
        <Card :icon="checkIcon" title="1247" description="Tâches terminées" layout="side" icon-color="text-green-500" />
        <Card :icon="fireIcon" title="74" description="Jours de streak" layout="side" icon-color="text-orange-600" />
        <Card :icon="starIcon" title="77" description="Niveau" layout="side" icon-color="text-yellow-400" />
      </div>
    </div>
    <div class="space-y-4">
      <h3>Badges</h3>
      <div class="grid gap-4 sm:grid-cols-6">
        <Card :icon="checkIcon" title="1247" description="Tâches terminées" />
        <Card :icon="fireIcon" title="74" description="Jours de streak" />
        <Card :icon="starIcon" title="titi" description="Niveau" />
        <Card :icon="checkIcon" title="1247" description="Tâches terminées" />
        <Card :icon="fireIcon" title="74" description="Jours de streak" />
        <Card :icon="starIcon" title="titi" description="Niveau" />
        <Card :icon="checkIcon" title="1247" description="Tâches terminées" />
        <Card :icon="fireIcon" title="74" description="Jours de streak" />
        <Card :icon="starIcon" title="titi" description="Niveau" />
      </div>
    </div>
    <div class="rounded-lg border border-white/10 bg-secondary p-6 space-y-4" >
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
            <NuxtLink
              v-if="!user?.isTwoFactorEnabled"
              to="/setup-2fa"
              class="px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-secondary font-medium transition-colors text-sm"
            >
              Activer
            </NuxtLink>
            <button
              v-else
              @click="showDisable2FAModal = true"
              class="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-medium transition-colors text-sm"
            >
              Désactiver
            </button>
            <span
              v-if="user?.isTwoFactorEnabled"
              class="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-medium text-sm flex items-center gap-2"
            >
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
        <div class="flex gap-4 justify-between items-center" >
          <p>Thème</p>
          <div class="flex gap-2" >
            <button class="bg-accent text-secondary font-medium py-2 px-4 rounded-md cursor-pointer">Sombre</button>
            <button class="bg-white/10 text-white font-medium py-2 px-4 rounded-md ml-2 cursor-pointer">Clair</button>
            <button class="bg-white/10 text-white font-medium py-2 px-4 rounded-md ml-2 cursor-pointer">Système</button>
          </div>
        </div>
      </div>
    </div>
  </section>
  <EditProfileModal :show="showEdit" :user="user || undefined" @close="showEdit = false" @save="onSave" />
  
  <!-- Disable 2FA Modal -->
  <div v-if="showDisable2FAModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-secondary rounded-lg border border-white/10 p-6 max-w-md w-full">
      <h3 class="text-xl font-bold mb-4">Désactiver la double authentification</h3>
      <p class="text-text/70 mb-4">Êtes-vous sûr de vouloir désactiver la double authentification? Votre compte sera moins sécurisé.</p>
      
      <div v-if="showPassword" class="space-y-4 mb-4">
        <div>
          <label class="block text-sm font-medium mb-2">Mot de passe</label>
          <input
            v-model="disablePassword"
            type="password"
            placeholder="Entrez votre mot de passe"
            class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-accent outline-none transition-colors"
          />
        </div>
        <div v-if="disableError" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {{ disableError }}
        </div>
      </div>

      <div class="flex gap-3">
        <button
          v-if="!showPassword"
          @click="showPassword = true"
          class="flex-1 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-medium transition-colors"
        >
          Continuer
        </button>
        <button
          v-else
          @click="confirmDisable2FA"
          :disabled="!disablePassword || isDisablingLoading"
          class="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isDisablingLoading ? 'Désactivation...' : 'Désactiver' }}
        </button>
        <button
          @click="showDisable2FAModal = false; showPassword = false; disablePassword = ''; disableError = ''"
          class="flex-1 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-text font-medium transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/composables/useAuthStore';
import { useTwoFactor } from '~/composables/useTwoFactor';
import Card from "~/components/global/card.vue";
import EditProfileModal from "~/components/global/EditProfileModal.vue";
import fireIcon from "~/assets/icons/fire.svg";
import checkIcon from "~/assets/icons/check.svg";
import starIcon from "~/assets/icons/star.svg";
import { getLevelFromPoints, getNextLevelPoints } from "~/utils/levelSystem";
import data from "../data.json";

const authStore = useAuthStore();
const { isLoading: isTwoFactorLoading, disableTwoFactor } = useTwoFactor();

const user = computed(() => authStore.user.value);
const showEdit = ref(false);
const showDisable2FAModal = ref(false);
const showPassword = ref(false);
const disablePassword = ref('');
const disableError = ref('');
const isDisablingLoading = ref(false);

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
      authStore.user = response.data.user as any;
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
