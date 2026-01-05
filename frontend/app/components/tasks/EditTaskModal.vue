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
                <h3 class="text-xl font-semibold">Modifier la tâche</h3>
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

                <!-- Column (if columns are provided) -->
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

                <!-- Action buttons -->
                <div class="flex items-center justify-between gap-3 pt-2">
                    <button
                        type="button"
                        @click="showDeleteConfirm = true"
                        :disabled="loading || deleting"
                        class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg font-semibold transition-colors border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Supprimer
                    </button>
                    
                    <div class="flex gap-3">
                        <button
                            type="button"
                            @click="closeModal"
                            :disabled="loading || deleting"
                            class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            :disabled="loading || deleting"
                            class="px-4 py-2 bg-accent hover:bg-accent/90 text-primary rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {{ loading ? 'Modification...' : 'Enregistrer' }}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="showDeleteConfirm = false"
    >
        <div class="bg-secondary rounded-xl border border-red-500/30 p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-white">Supprimer la tâche</h3>
                    <p class="text-sm text-white/60">Cette action est irréversible</p>
                </div>
            </div>
            
            <p class="text-white/80 text-sm mb-6">
                Êtes-vous sûr de vouloir supprimer la tâche "<span class="font-semibold text-white">{{ task?.title }}</span>" ?
            </p>

            <div class="flex gap-3 justify-end">
                <button
                    type="button"
                    @click="showDeleteConfirm = false"
                    :disabled="deleting"
                    class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Annuler
                </button>
                <button
                    type="button"
                    @click="confirmDelete"
                    :disabled="deleting"
                    class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {{ deleting ? 'Suppression...' : 'Supprimer' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { apiClient } from '~/utils/api';

interface Task {
    _id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
    columnName: string;
    columnId?: string;
}

interface Column {
    _id: string;
    name: string;
}

const props = defineProps<{
    isOpen: boolean;
    task: Task | null;
    columns?: Column[];
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'updated'): void;
    (e: 'deleted'): void;
}>();

const formData = ref({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    columnName: '',
});

const loading = ref(false);
const deleting = ref(false);
const error = ref<string | null>(null);
const showDeleteConfirm = ref(false);

// Reset form when modal opens with task data
watch(() => props.task, (task) => {
    if (task && props.isOpen) {
        formData.value = {
            title: task.title,
            description: task.description,
            dueDate: task.dueDate.split('T')[0], // Format YYYY-MM-DD
            priority: task.priority,
            columnName: task.columnName || '',
        };
        error.value = null;
        showDeleteConfirm.value = false;
    }
}, { immediate: true });

const closeModal = () => {
    if (!loading.value && !deleting.value) {
        showDeleteConfirm.value = false;
        emit('close');
    }
};

const handleSubmit = async () => {
    if (!props.task) return;
    
    loading.value = true;
    error.value = null;

    try {
        // Find the column ID if column name changed
        let columnId = props.task.columnId;
        if (props.columns && formData.value.columnName !== props.task.columnName) {
            const newColumn = props.columns.find(col => col.name === formData.value.columnName);
            if (newColumn) {
                columnId = newColumn._id;
            }
        }

        const response = await apiClient.put(`/api/tasks/${props.task._id}`, {
            title: formData.value.title,
            description: formData.value.description,
            dueDate: formData.value.dueDate,
            priority: formData.value.priority,
            columnName: formData.value.columnName,
            columnId: columnId,
        });

        if (response.success) {
            emit('updated');
            // Close modal after successful update
            setTimeout(() => {
                emit('close');
            }, 100);
        } else {
            error.value = response.error || 'Erreur lors de la modification de la tâche';
        }
    } catch (err: any) {
        error.value = err.message || 'Erreur lors de la modification de la tâche';
    } finally {
        loading.value = false;
    }
};

const confirmDelete = async () => {
    if (!props.task) return;
    
    deleting.value = true;
    error.value = null;

    try {
        const response = await apiClient.delete(`/api/tasks/${props.task._id}`);

        if (response.success) {
            emit('deleted');
            showDeleteConfirm.value = false;
            // Close modal after successful delete
            setTimeout(() => {
                emit('close');
            }, 100);
        } else {
            error.value = response.error || 'Erreur lors de la suppression de la tâche';
            showDeleteConfirm.value = false;
        }
    } catch (err: any) {
        error.value = err.message || 'Erreur lors de la suppression de la tâche';
        showDeleteConfirm.value = false;
    } finally {
        deleting.value = false;
    }
};
</script>
