<template>
    <div class="min-h-screen bg-primary text-white p-8">
        <div class="max-w-7xl mx-auto">
            <div class="mb-8">
                <h1 class="text-3xl font-bold mb-4">Test des états Kanban</h1>
                <p class="text-white/70 mb-6">
                    Cette page permet de tester les différents états du composant Kanban,
                    y compris le fallback "Sans colonne".
                </p>

                <!-- Test Mode Selector -->
                <div class="flex gap-4 mb-8">
                    <button
                        v-for="mode in testModes"
                        :key="mode.key"
                        @click="currentTestMode = mode.key"
                        :class="[
                            'px-4 py-2 rounded-md font-medium transition-colors',
                            currentTestMode === mode.key
                                ? 'bg-accent text-secondary'
                                : 'bg-secondary/40 text-white/80 hover:bg-secondary/60'
                        ]"
                    >
                        {{ mode.label }}
                    </button>
                </div>
            </div>

            <!-- Current Test Mode Info -->
            <div class="mb-6 bg-secondary/30 border border-white/10 rounded-lg p-4">
                <h2 class="text-lg font-semibold mb-2">
                    Mode actuel: {{ getCurrentModeLabel() }}
                </h2>
                <p class="text-white/70 text-sm">
                    {{ getCurrentModeDescription() }}
                </p>
            </div>

            <!-- Kanban Component -->
            <div class="bg-secondary/20 border border-white/10 rounded-xl p-6">
                <h3 class="text-xl font-semibold mb-4">Composant Kanban</h3>
                <Kanban
                    workspace-id="test-workspace-id"
                    :test-mode="currentTestMode"
                />
            </div>

            <!-- Implementation Notes -->
            <div class="mt-8 bg-secondary/20 border border-white/10 rounded-lg p-6">
                <h3 class="text-lg font-semibold mb-3">Notes d'implémentation</h3>
                <div class="text-sm text-white/80 space-y-3">
                    <div>
                        <strong class="text-accent">État normal:</strong>
                        Le workspace service ajoute automatiquement des colonnes par défaut
                        ("À faire", "En cours", "Terminé") lors de la création d'un workspace.
                    </div>
                    <div>
                        <strong class="text-accent">Fallback "Sans colonne":</strong>
                        Cet état peut survenir temporairement lors de problèmes de base de données,
                        de migration de données, ou pendant le chargement initial.
                    </div>
                    <div>
                        <strong class="text-accent">Permissions:</strong>
                        Seuls les propriétaires et administrateurs peuvent ajouter/supprimer des colonnes.
                        Les autres membres voient un message les invitant à contacter un admin.
                    </div>
                    <div>
                        <strong class="text-accent">Migration automatique:</strong>
                        Le service workspace applique automatiquement les colonnes par défaut
                        aux workspaces existants qui n'en ont pas.
                    </div>
                </div>
            </div>

            <!-- Back to App -->
            <div class="mt-8 text-center">
                <NuxtLink
                    to="/"
                    class="inline-flex items-center gap-2 bg-accent text-secondary px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
                >
                    <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    Retour à l'application
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Kanban from "~/components/kanban/kanban.vue";

// Test modes
const testModes = [
    {
        key: null,
        label: "Normal",
        description: "Mode normal avec chargement réel depuis l'API"
    },
    {
        key: "no-columns",
        label: "Sans colonne",
        description: "Simule un workspace sans colonnes configurées"
    },
    {
        key: "loading",
        label: "Chargement",
        description: "Simule un état de chargement prolongé"
    },
    {
        key: "error",
        label: "Erreur",
        description: "Simule une erreur de chargement"
    }
] as const;

const currentTestMode = ref<typeof testModes[number]['key']>(null);

// Helper functions
const getCurrentModeLabel = () => {
    const mode = testModes.find(m => m.key === currentTestMode.value);
    return mode?.label || "Normal";
};

const getCurrentModeDescription = () => {
    const mode = testModes.find(m => m.key === currentTestMode.value);
    return mode?.description || "Mode normal avec chargement réel depuis l'API";
};

// Page meta
useHead({
    title: "Test Kanban - Procrastinator",
    meta: [
        {
            name: "description",
            content: "Page de test pour les différents états du composant Kanban"
        }
    ]
});
</script>
