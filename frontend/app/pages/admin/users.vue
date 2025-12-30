<template>
  <section class="p-6 bg-primary min-h-screen text-text">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Gestion des utilisateurs</h1>
      <div>
        <button @click="refresh" class="px-4 py-2 bg-accent text-secondary rounded-md">Actualiser</button>
      </div>
    </div>

    <div v-if="!isAdmin" class="p-6 bg-secondary rounded-lg"></div>

    <div v-else class="space-y-4">
      <div class="rounded-lg border border-white/10 bg-secondary p-4">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="text-sm text-white/70">
                <th class="p-3">#</th>
                <th class="p-3">Utilisateur</th>
                <th class="p-3">Email</th>
                <th class="p-3">Rôle</th>
                <th class="p-3">Actif</th>
                <th class="p-3">Email vérifié</th>
                <th class="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(u, i) in users" :key="u._id" class="border-t border-white/5">
                <td class="p-3 align-middle">{{ (page - 1) * limit + i + 1 }}</td>
                <td class="p-3 align-middle flex items-center gap-3">
                  <img :src="u.profile?.avatar || u.avatar || '/assets/icons/user.svg'" alt="avatar" class="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div class="font-medium">{{ u.firstName }} {{ u.lastName }}</div>
                    <div class="text-sm text-white/60">{{ u.username }}</div>
                  </div>
                </td>
                <td class="p-3 align-middle">{{ u.email }}</td>
                <td class="p-3 align-middle">{{ u.role }}</td>
                <td class="p-3 align-middle">{{ u.isActive ? 'Oui' : 'Non' }}</td>
                <td class="p-3 align-middle">{{ u.isEmailVerified ? 'Oui' : 'Non' }}</td>
                <td class="p-3 align-middle">
                  <div class="flex gap-2">
                    <button @click="openEdit(u)" class="px-2 py-1 bg-white/10 rounded text-sm">Modifier</button>
                    <button @click="confirmDelete(u)" class="px-2 py-1 bg-red-500/10 text-red-400 rounded text-sm">Supprimer</button>
                  </div>
                </td>
              </tr>
              <tr v-if="users.length === 0">
                <td colspan="7" class="p-4 text-center text-white/60">Aucun utilisateur trouvé.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between mt-4">
          <div class="text-sm text-white/60">Total: {{ total }}</div>
          <div class="flex items-center gap-2">
            <button :disabled="page <= 1" @click="setPage(page - 1)" class="px-3 py-1 bg-white/5 rounded">Préc</button>
            <div class="px-3">{{ page }} / {{ totalPages }}</div>
            <button :disabled="page >= totalPages" @click="setPage(page + 1)" class="px-3 py-1 bg-white/5 rounded">Suiv</button>
          </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-secondary rounded-lg p-6 w-full max-w-lg">
          <h3 class="text-xl font-bold mb-4">Modifier l'utilisateur</h3>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-1">Prénom</label>
              <input v-model="editForm.firstName" class="w-full rounded-md p-2 bg-primary text-text border border-white/10" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Nom</label>
              <input v-model="editForm.lastName" class="w-full rounded-md p-2 bg-primary text-text border border-white/10" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Rôle</label>
              <select v-model="editForm.role" class="w-full rounded-md p-2 bg-primary text-text border border-white/10">
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <div class="flex gap-4">
              <label class="flex items-center gap-2"><input type="checkbox" v-model="editForm.isActive" /> Actif</label>
              <label class="flex items-center gap-2"><input type="checkbox" v-model="editForm.isEmailVerified" /> Email vérifié</label>
            </div>
          </div>

          <div class="flex gap-2 justify-end mt-4">
            <button @click="closeEdit" class="px-4 py-2 bg-white/10 rounded">Annuler</button>
            <button @click="saveEdit" class="px-4 py-2 bg-accent text-secondary rounded">Enregistrer</button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-secondary rounded-lg p-6 w-full max-w-md">
          <h3 class="text-lg font-bold mb-2">Confirmer la suppression</h3>
          <p class="text-sm text-white/70 mb-4">Supprimer <strong>{{ deletingUser?.email }}</strong> est irréversible. Voulez-vous continuer ?</p>
          <div class="flex gap-2 justify-end">
            <button @click="cancelDelete" class="px-4 py-2 bg-white/10 rounded">Annuler</button>
            <button @click="performDelete" class="px-4 py-2 bg-red-500 text-secondary rounded">Supprimer</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loadingState" class="fixed bottom-4 right-4 bg-accent text-secondary px-4 py-2 rounded">Chargement...</div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/composables/useAuthStore';
import { authApi, type User } from '~/composables/useAuth';
import { useRouter } from 'vue-router'

const authStore = useAuthStore();
const user = authStore.user;
const router = useRouter();

const isAdmin = computed(() => !!user.value && user.value.role === 'admin');

if(!authStore.token?.value) {
  router.push('/')
}

const users = ref<User[]>([]);
const total = ref(0);
const page = ref(1);
const limit = ref(10);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)));
const loadingState = ref(false);
const error = ref<string | null>(null);

const showEditModal = ref(false);
const editForm = ref<any>({});
const editingUserId = ref<string | null>(null);

const showDeleteModal = ref(false);
const deletingUser = ref<User | null>(null);

async function fetchUsers() {
  if (!isAdmin.value) return;
  loadingState.value = true;
  error.value = null;
  try {
    const res = await authApi.getAllUsers({ page: page.value, limit: limit.value });
    if (res.success && res.data) {
      users.value = res.data.users || [];
      total.value = res.data.total ?? users.value.length;
    } else {
      error.value = res.error || 'Erreur lors de la récupération';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur inattendue';
  } finally {
    loadingState.value = false;
  }
}

function setPage(p: number) {
  if (p < 1) p = 1;
  if (p > totalPages.value) p = totalPages.value;
  page.value = p;
  fetchUsers();
}

function refresh() {
  fetchUsers();
}

function openEdit(u: User) {
  editingUserId.value = u._id;
  editForm.value = {
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    isActive: u.isActive,
    isEmailVerified: u.isEmailVerified,
  };
  showEditModal.value = true;
}

function closeEdit() {
  showEditModal.value = false;
  editingUserId.value = null;
}

async function saveEdit() {
  if (!editingUserId.value) return;
  loadingState.value = true;
  try {
    const payload: Partial<User> = {
      firstName: editForm.value.firstName,
      lastName: editForm.value.lastName,
      role: editForm.value.role,
      isActive: editForm.value.isActive,
      isEmailVerified: editForm.value.isEmailVerified,
    };
    const res = await authApi.updateUserById(editingUserId.value, payload);
    if (res.success) {
      await fetchUsers();
      closeEdit();
    } else {
      console.error('Update failed', res.error);
    }
  } catch (err) {
    console.error(err);
  } finally {
    loadingState.value = false;
  }
}

function confirmDelete(u: User) {
  deletingUser.value = u;
  showDeleteModal.value = true;
}

function cancelDelete() {
  deletingUser.value = null;
  showDeleteModal.value = false;
}

async function performDelete() {
  if (!deletingUser.value) return;
  loadingState.value = true;
  try {
    const res = await authApi.deleteUserById(deletingUser.value._id);
    if (res.success) {
      await fetchUsers();
      cancelDelete();
    } else {
      console.error('Delete failed', res.error);
    }
  } catch (err) {
    console.error(err);
  } finally {
    loadingState.value = false;
  }
}

onMounted(async () => {
  await authStore.init();
  if (!authStore.token?.value) {
    window.location.href = '/login';
    return;
  }
  await authStore.fetchCurrentUser();
  if (!isAdmin.value) {
    return;
  }
  await fetchUsers();
});
</script>

<style scoped>
@media (max-width: 640px) {
  table thead { display: none; }
  table tbody tr { display: grid; grid-template-columns: 1fr; gap: 6px; padding: 8px 0; }
  table tbody td { display: block; padding: 6px 0; }
}
</style>
