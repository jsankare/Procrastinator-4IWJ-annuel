<template >
  <section class="space-y-6 bg-primary min-h-screen text-text">
    <div class="relative flex flex-col items-center justify-center py-10 mb-6 bg-linear-to-r from-accent/30 to-secondary/30 rounded-b-3xl shadow-lg">
      <button @click="showEdit = true" class="absolute top-4 right-4 bg-accent text-secondary px-4 py-2 rounded-lg font-semibold shadow hover:bg-accent/80 transition-all flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3zm0 0v3h3" /></svg>
        Modifier
      </button>
      <label class="w-28 h-28 rounded-full overflow-hidden border-4 border-accent shadow-lg mb-4 cursor-pointer group relative" title="Changer l'avatar">
        <input type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
        <img :src="user?.avatar || '/assets/icons/user.svg'" alt="Avatar" class="object-cover w-full h-full" />
        <span class="absolute bottom-2 right-2 bg-accent text-secondary rounded-full p-1 shadow group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3zm0 0v3h3" /></svg>
        </span>
      </label>
      <h1 class="text-3xl font-bold tracking-tight">{{ user?.firstName }} {{ user?.lastName }}</h1>
      <p class="text-lg text-accent font-semibold">Niveau {{ getLevelFromPoints(user?.points) }}</p>
      <p v-if="user?.points" class="text-sm text-white/70">
        {{ user.points }} pts • Prochain palier: {{ getNextLevelPoints(getLevelFromPoints(user.points) + 1) }} pts
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
  <EditProfileModal :show="showEdit" :user="user" @close="showEdit = false" @save="onSave" />
</template>
<script setup lang="ts">
import { ref } from 'vue';
import Card from "~/components/global/card.vue";
import EditProfileModal from "~/components/global/EditProfileModal.vue";
import fireIcon from "~/assets/icons/fire.svg";
import checkIcon from "~/assets/icons/check.svg";
import starIcon from "~/assets/icons/star.svg";
import { getLevelFromPoints, getNextLevelPoints } from "~/utils/levelSystem";
import data from "../data.json";
const user = ref<any>({ ...data.users[0] });
const showEdit = ref(false);
function onSave(newData: any) {
  user.value = { ...user.value, ...newData };
}
function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    user.value.avatar = ev.target?.result as string;
  };
  reader.readAsDataURL(file);
}
</script>