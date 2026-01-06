<template>
    <Transition name="modal">
        <div
            v-if="isOpen"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            @click.self="closeModal"
        >
            <div
                class="bg-secondary rounded-2xl border border-white/10 w-full max-w-md shadow-2xl transform transition-all max-h-[85vh] flex flex-col"
            >
                <!-- Header -->
                <div class="flex items-center justify-between px-3 py-2 border-b border-white/10">
                    <h3 class="text-base font-semibold">Créer une tâche</h3>
                    <button
                        @click="closeModal"
                        class="p-0.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all hover:rotate-90 duration-300"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <!-- Form Content -->
                <div class="px-3 py-2 space-y-2">

                <!-- Title -->
                <div>
                    <label class="block text-xs font-medium mb-1">Titre *</label>
                    <input
                        v-model="formData.title"
                        type="text"
                        required
                        class="w-full bg-primary/50 border border-white/20 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                        placeholder="Ex: Finir le rapport"
                    />
                </div>

                <!-- Description -->
                <div>
                    <label class="block text-xs font-medium mb-1">Description *</label>
                    <textarea
                        v-model="formData.description"
                        required
                        rows="2"
                        class="w-full bg-primary/50 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                        placeholder="Détails de la tâche..."
                    ></textarea>
                </div>

                <!-- Due Date -->
                <div>
                    <label class="block text-xs font-medium mb-1">Date d'échéance *</label>
                    <input
                        v-model="formData.dueDate"
                        type="date"
                        required
                        class="w-full bg-primary/50 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                </div>

                <!-- Priority -->
                <div>
                    <label class="block text-xs font-medium mb-1">Priorité *</label>
                    <select
                        v-model="formData.priority"
                        required
                        class="w-full bg-primary/50 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                        <option value="low">Faible</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Élevée</option>
                    </select>
                </div>

                <!-- Column -->
                <div v-if="columns && columns.length > 0">
                    <label class="block text-xs font-medium mb-1">Colonne *</label>
                    <select
                        v-model="formData.columnName"
                        required
                        class="w-full bg-primary/50 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                        <option v-for="col in columns" :key="col._id" :value="col.name">
                            {{ col.name }}
                        </option>
                    </select>
                </div>

                <!-- Assigned Members -->
                <div v-if="workspaceMembers && workspaceMembers.length > 0">
                    <label class="block text-xs font-medium mb-1">Membres assignés</label>
                    <select
                        v-model="selectedMembers"
                        multiple
                        class="w-full bg-primary/50 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent min-h-[60px] max-h-20"
                    >
                        <option 
                            v-for="member in workspaceMembers" 
                            :key="member.userId"
                            :value="member.userId"
                            class="py-0.5"
                        >
                            {{ member.firstName }} {{ member.lastName }} ({{ member.username }})
                        </option>
                    </select>
                    <p class="text-[10px] text-white/40 mt-0.5">
                        {{ selectedMembers.length }} membre(s) - Maintenez Ctrl/Cmd pour sélectionner plusieurs
                    </p>
                </div>

                <!-- Error message -->
                <div v-if="error" class="text-red-400 text-[11px] bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                    {{ error }}
                </div>
                </div>

                <!-- Footer with Actions -->
                <div class="flex items-center justify-end gap-1.5 px-3 py-2 border-t border-white/10 bg-primary/10">
                    <button
                        type="button"
                        @click="closeModal"
                        :disabled="loading"
                        class="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        @click="handleSubmit"
                        :disabled="loading"
                        class="px-4 py-1 bg-accent hover:bg-accent/90 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                        {{ loading ? 'Création...' : 'Créer' }}
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-active > div,
.modal-leave-active > div {
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
    transform: scale(0.95);
    opacity: 0;
}
</style>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTaskStore } from '~/composables/useTaskStore';
import type { CreateTaskInput } from '~/types/task';

const props = defineProps<{
    isOpen: boolean;
    workspaceId?: string;
    columns?: Array<{ _id: string; name: string }>;
    workspaceMembers?: Array<{
        userId: string;
        username: string;
        firstName: string;
        lastName: string;
        email: string;
    }>;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'created'): void;
}>();

const taskStore = useTaskStore();
const selectedMembers = ref<string[]>([]);

const formData = ref<CreateTaskInput>({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    columnName: '',
    workspaceId: props.workspaceId ?? undefined,
});

const loading = ref(false);
const error = ref<string | null>(null);

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        // Set default column to first available column
        const defaultColumn = (props.columns && props.columns.length > 0) 
            ? props.columns[0]?.name || 'À faire'
            : 'À faire';
        
        formData.value = {
            title: '',
            description: '',
            dueDate: new Date().toISOString().split('T')[0],
            priority: 'medium',
            columnName: defaultColumn,
            workspaceId: props.workspaceId ?? undefined,
        };
        selectedMembers.value = [];
        error.value = null;
    }
});

const closeModal = () => {
    emit('close');
};

const handleSubmit = async () => {
    loading.value = true;
    error.value = null;

    try {
        const taskData: CreateTaskInput = {
            ...formData.value,
            assignedMembers: selectedMembers.value.length > 0 ? selectedMembers.value : undefined,
        };
        await taskStore.createTask(taskData);
        emit('created');
        closeModal();
    } catch (err: any) {
        error.value = err.message || 'Erreur lors de la création de la tâche';
    } finally {
        loading.value = false;
    }
};
</script>
