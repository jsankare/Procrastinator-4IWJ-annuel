<template>
  <teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/50" @click="close()"></div>
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div class="w-full max-w-lg rounded-lg bg-primary text-text shadow-xl border border-text/10">
          <div class="flex items-center justify-between px-5 py-4 border-b border-text/10">
            <h3 class="text-lg font-semibold">Rejoindre un workspace</h3>
            <button type="button" class="px-2 py-1 text-text/70 hover:text-text" @click="close()">✕</button>
          </div>

          <form class="px-5 py-4 space-y-4" @submit.prevent="onSubmit">
            <div>
              <label class="block text-sm mb-1">Code ou lien d’invitation <span class="text-red-500">*</span></label>
              <input
                v-model="form.invite"
                type="text"
                class="w-full rounded-md border border-text/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-text/30"
                placeholder="Ex: ABCD-1234 ou https://app.exemple.com/invite/ABCD-1234"
              />
              <p v-if="errors.invite" class="mt-1 text-sm text-red-500">{{ errors.invite }}</p>
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
                <span v-if="loading">Rejoindre…</span>
                <span v-else>Rejoindre</span>
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

const props = withDefaults(
  defineProps<{ open: boolean; loading?: boolean }>(),
  { loading: false }
)

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'submit', payload: { invite: string }): void
}>()

const isOpen = computed({
  get: () => props.open,
  set: (v: boolean) => emit('update:open', v),
})

const form = reactive<{ invite: string }>({ invite: '' })
const errors = reactive<{ invite?: string }>({})

function validate(): boolean {
  errors.invite = undefined
  if (!form.invite || form.invite.trim().length < 6) {
    errors.invite = 'Veuillez saisir un code ou un lien valide.'
  }
  return !errors.invite
}

function normalizeInvite(value: string): string {
  const v = (value || '').trim()
  const match = v.match(/invite\/([A-Z0-9-]+)/i)
  if (match && match[1]) {
    return match[1]
  }
  return v
}

function close() {
  isOpen.value = false
}

function onSubmit() {
  if (!validate()) return
  const code = normalizeInvite(form.invite)
  emit('submit', { invite: code })
  close()
}
</script>