<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 sm:px-0">
    <div class="bg-secondary rounded-xl shadow-xl p-4 sm:p-8 w-full max-w-md relative">
      <button @click="$emit('close')" class="absolute top-2 sm:top-4 right-2 sm:right-4 text-xl text-accent hover:text-accent/80">&times;</button>
      <h2 class="text-xl sm:text-2xl font-bold mb-4 text-center">Modifier le profil</h2>
      <form @submit.prevent="submit">
        <div class="flex flex-col items-center mb-4 sm:mb-6">
          <label class="relative cursor-pointer group" title="Changer l'avatar">
            <input type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
            <span class="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-accent shadow-lg flex items-center justify-center bg-primary">
              <img :src="form.avatar || '/assets/icons/user.svg'" alt="Avatar" class="object-cover w-full h-full" />
            </span>
            <span class="absolute bottom-2 right-2 bg-accent text-secondary rounded-full p-1 shadow group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3zm0 0v3h3" /></svg>
            </span>
          </label>
        </div>
        <div class="mb-3 sm:mb-4">
          <label class="block mb-1 font-medium">Prénom</label>
          <input v-model="form.firstName" class="w-full rounded-md p-2 bg-primary text-text border border-white/10 text-sm sm:text-base" />
        </div>
        <div class="mb-3 sm:mb-4">
          <label class="block mb-1 font-medium">Nom</label>
          <input v-model="form.lastName" class="w-full rounded-md p-2 bg-primary text-text border border-white/10 text-sm sm:text-base" />
        </div>
        <div class="mb-3 sm:mb-4">
          <label class="block mb-1 font-medium">Avatar (URL)</label>
          <input v-model="form.avatar" class="w-full rounded-md p-2 bg-primary text-text border border-white/10 text-sm sm:text-base" placeholder="Coller une URL ou utiliser l'upload ci-dessus" />
        </div>
        <div class="flex flex-col sm:flex-row justify-end gap-2 mt-4">
          <button type="button" @click="$emit('close')" class="px-4 py-2 rounded-md bg-white/10 text-white">Annuler</button>
          <button type="submit" class="px-4 py-2 rounded-md bg-accent text-secondary font-semibold">Enregistrer</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
const props = defineProps({
  show: Boolean,
  user: Object
});
const emit = defineEmits(['close', 'save']);
const form = ref({
  firstName: '',
  lastName: '',
  avatar: ''
});
watch(() => props.user, (u) => {
  if (u) {
    form.value = {
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      avatar: u.avatar || ''
    };
  }
}, { immediate: true });
function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    form.value.avatar = ev.target?.result as string;
  };
  reader.readAsDataURL(file);
}
function submit() {
  emit('save', { ...form.value });
  emit('close');
}
</script>
