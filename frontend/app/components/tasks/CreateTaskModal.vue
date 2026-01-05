<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="closeModal"
    >
        <div
            class="bg-secondary rounded-xl border border-white/10 p-6 w-full max-w-md mx-4 shadow-2xl"
        >
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold">Créer une tâche</h3>
                <button
                    @click="closeModal"
                    class="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors"
                >
                    <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- Title -->
                <div>
                    <label class="block text-sm font-medium mb-2">Titre *</label>
                    <input
                        v-model="formData.title"
                        type="text"
                        required
                        class="w-full bg-primary/50 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Ex: Finir le rapport"
                    />
                </div>

                <!-- Description -->
                <div>
                    <label class="block text-sm font-medium mb-2">Description *</label>
                    <textarea
                        v-model="formData.description"
                        required
                        rows="3"
                        class="w-full bg-primary/50 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                        placeholder="Détails de la tâche..."
                    ></textarea>
                </div>

                <!-- Due Date -->
                <div>
                    <label class="block text-sm font-medium mb-2">Date d'échéance *</label>
                    <input
                        v-model="formData.dueDate"
                        type="date"
                        required
                        class="w-full bg-primary/50 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <!-- Priority -->
                <div>
                    <label class="block text-sm font-medium mb-2">Priorité *</label>
                    <select
                        v-model="formData.priority"
                        required
                        class="w-full bg-primary/50 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                        <option value="low">Faible</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Élevée</option>
                    </select>
                </div>

                <!-- Column -->
                <div v-if="columns && columns.length > 0">
                    <label class="block text-sm font-medium mb-2">Colonne *</label>
                    <select
                        v-model="formData.columnName"
                        required
                        class="w-full bg-primary/50 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                        <option v-for="col in columns" :key="col._id" :value="col.name">
                            {{ col.name }}
                        </option>
                    </select>
                </div>

                <!-- Error message -->
                <div v-if="error" class="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    {{ error }}
                </div>

                <!-- Actions -->
                <div class="flex gap-3 pt-2">
                    <button
                        type="button"
                        @click="closeModal"
                        class="flex-1 px-4 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        :disabled="loading"
                        class="flex-1 px-4 py-2 bg-accent hover:bg-accent/90 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {{ loading ? 'Création...' : 'Créer' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTaskStore } from '~/composables/useTaskStore';
import type { CreateTaskInput } from '~/types/task';

const props = defineProps<{
    isOpen: boolean;
    workspaceId?: string;
    columns?: Array<{ _id: string; name: string }>;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'created'): void;
}>();

const taskStore = useTaskStore();

const formData = ref<CreateTaskInput>({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    columnName: '',
    workspaceId: props.workspaceId,
});

const loading = ref(false);
const error = ref<string | null>(null);

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        // Set default column to first available column
        const defaultColumn = (props.columns && props.columns.length > 0) 
            ? props.columns[0].name 
            : 'À faire';
        
        formData.value = {
            title: '',
            description: '',
            dueDate: new Date().toISOString().split('T')[0],
            priority: 'medium',
            columnName: defaultColumn,
            workspaceId: props.workspaceId,
        };
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
        await taskStore.createTask(formData.value);
        emit('created');
        closeModal();
    } catch (err: any) {
        error.value = err.message || 'Erreur lors de la création de la tâche';
    } finally {
        loading.value = false;
    }
};
</script>
