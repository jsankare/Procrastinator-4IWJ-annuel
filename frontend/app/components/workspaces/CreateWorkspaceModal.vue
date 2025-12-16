<template>
  <teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/50" @click="close()"></div>
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div class="w-full max-w-lg rounded-lg bg-primary text-text shadow-xl border border-text/10">
          <div class="flex items-center justify-between px-5 py-4 border-b border-text/10">
            <h3 class="text-lg font-semibold">Créer un workspace</h3>
            <button type="button" class="px-2 py-1 text-text/70 hover:text-text" @click="close()">✕</button>
          </div>

          <form class="px-5 py-4 space-y-4" @submit.prevent="onSubmit">
            <div>
              <label class="block text-sm mb-1">Nom <span class="text-red-500">*</span></label>
              <input
                v-model="form.name"
                type="text"
                class="w-full rounded-md border border-text/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-text/30"
                placeholder="Ex: Équipe Produit"
              />
              <p v-if="errors.name" class="mt-1 text-sm text-red-500">{{ errors.name }}</p>
            </div>

            <div>
              <label class="block text-sm mb-1">Description</label>
              <textarea
                v-model="form.description"
                rows="3"
                class="w-full rounded-md border border-text/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-text/30"
                placeholder="Optionnel"
              />
            </div>

            <div>
              <label class="block text-sm mb-1">Visibilité <span class="text-red-500">*</span></label>
              <select
                v-model="form.visibility"
                class="w-full rounded-md border border-text/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-text/30"
              >
                <option value="private">Privé (recommandé)</option>
                <option value="public">Public</option>
              </select>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                class="rounded-md border border-text/20 px-4 py-2 text-sm"
                @click="close()"
                :disabled="loading"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-md bg-text text-primary px-4 py-2 text-sm disabled:opacity-50"
                :disabled="loading"
              >
                <span v-if="loading">Création…</span>
                <span v-else>Créer</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'

type Visibility = 'private' | 'public'
interface CreateWorkspacePayload {
  name: string
  description?: string
  visibility: Visibility
}

const props = withDefaults(
  defineProps<{ open: boolean; loading?: boolean }>(),
  { loading: false }
)

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'submit', payload: CreateWorkspacePayload): void
}>()

const isOpen = computed({
  get: () => props.open,
  set: (v: boolean) => emit('update:open', v),
})

const form = reactive<CreateWorkspacePayload>({
  name: '',
  description: '',
  visibility: 'private',
})

const errors = reactive<{ name?: string }>({})

function validate(): boolean {
  errors.name = undefined
  if (!form.name || form.name.trim().length < 3) {
    errors.name = 'Le nom doit contenir au moins 3 caractères.'
  }
  return !errors.name
}

function close() {
  isOpen.value = false
}

function onSubmit() {
  if (!validate()) return
  emit('submit', {
    name: form.name.trim(),
    description: (form.description || '').trim() || undefined,
    visibility: form.visibility,
  })
  close()
}
</script>