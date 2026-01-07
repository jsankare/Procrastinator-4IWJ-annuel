<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 sm:px-0">
    <div class="bg-secondary rounded-xl shadow-xl p-4 sm:p-8 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
      <button @click="$emit('close')" class="absolute top-2 sm:top-4 right-2 sm:right-4 text-xl text-accent hover:text-accent/80">&times;</button>
      <h2 class="text-xl sm:text-2xl font-bold mb-4 text-center">Modifier le profil</h2>
      <form @submit.prevent="submit">
        <div class="flex flex-col items-center mb-4 sm:mb-6">
          <label class="relative cursor-pointer group" title="Changer l'avatar">
            <input type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
            <span class="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-accent shadow-lg flex items-center justify-center">
              <img :src="form.avatar || '/assets/icons/user.svg'" alt="Avatar" class="object-cover w-full h-full p-4" />
            </span>
            <div class="absolute bottom-0 right-0 bg-accent text-secondary p-1 rounded-full shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </div>
          </label>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-3 sm:mb-4">
            <div>
                <label class="block mb-1 font-medium text-sm">Prénom</label>
                <input v-model="form.firstName" class="w-full rounded-md p-2 bg-primary text-text border border-white/10 text-sm focus:border-accent outline-none transition-colors" />
            </div>
            <div>
                <label class="block mb-1 font-medium text-sm">Nom</label>
                <input v-model="form.lastName" class="w-full rounded-md p-2 bg-primary text-text border border-white/10 text-sm focus:border-accent outline-none transition-colors" />
            </div>
        </div>

        <div class="mb-3 sm:mb-4">
          <label class="block mb-1 font-medium text-sm">Nom d'utilisateur</label>
          <input v-model="form.username" class="w-full rounded-md p-2 bg-primary text-text border border-white/10 text-sm focus:border-accent outline-none transition-colors" />
        </div>

        <div class="mb-3 sm:mb-4">
          <label class="block mb-1 font-medium text-sm">Email</label>
          <input v-model="form.email" type="email" class="w-full rounded-md p-2 bg-primary text-text border border-white/10 text-sm focus:border-accent outline-none transition-colors" />
        </div>

        <div class="border-t border-white/10 pt-4 mt-6">
            <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Sécurité
            </h3>
             <div class="mb-3">
               <label class="block mb-1 font-medium text-xs text-white/70">Mot de passe actuel (si changement)</label>
               <input v-model="form.currentPassword" type="password" class="w-full rounded-md p-2 bg-primary text-text border border-white/10 text-sm focus:border-accent outline-none transition-colors" placeholder="••••••••" />
             </div>
             <div class="mb-3">
                <label class="block mb-1 font-medium text-xs text-white/70">Nouveau mot de passe</label>
               <input v-model="form.newPassword" type="password" class="w-full rounded-md p-2 bg-primary text-text border border-white/10 text-sm focus:border-accent outline-none transition-colors" placeholder="••••••••" />
             </div>
        </div>

        <div class="flex flex-col sm:flex-row justify-end gap-2 mt-6 border-t border-white/10 pt-4">
          <button type="button" @click="$emit('close')" class="px-4 py-2 rounded-md bg-white/5 hover:bg-white/10 text-white transition-colors">Annuler</button>
          <button type="submit" class="px-4 py-2 rounded-md bg-accent hover:bg-accent/90 text-secondary font-semibold transition-colors">Enregistrer</button>
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
  username: '',
  email: '',
  avatar: '',
  currentPassword: '',
  newPassword: ''
});
watch(() => props.user, (u) => {
  if (u) {
    form.value = {
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      username: u.username || '',
      email: u.email || '',
      avatar: (u.profile && u.profile.avatar) ? u.profile.avatar : (u.avatar || ''),
      currentPassword: '',
      newPassword: ''
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
