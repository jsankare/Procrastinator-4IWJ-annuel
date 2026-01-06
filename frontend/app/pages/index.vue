<template>
    <section class="space-y-8 bg-primary min-h-screen text-text flex flex-col items-center px-2 sm:px-0">
        <h1 class="text-2xl sm:text-3xl font-bold text-center mt-8">
            Procrastinator
        </h1>
        <p class="text-white/80 max-w-prose text-center mb-4">
            Tableau de bord personnel - Gérez toutes vos tâches
        </p>

        <!-- Loading State -->
        <div v-if="!isAuthCheckComplete" class="flex justify-center items-center pt-16">
            <p class="text-xl animate-pulse">Loading...</p>
        </div>

        <!-- Authenticated State -->
        <template v-else-if="isAuthenticated">
            <div class="w-full max-w-5xl">
                <h2
                    class="text-lg sm:text-xl font-semibold mb-3 text-center sm:text-left flex items-center justify-between">
                    <span>Aperçu & Progression</span>
                </h2>

                <!-- Gamification Header -->
                <div class="mb-6">
                    <UserLevelProgress :points="userStats.points" :level="userStats.level" />
                </div>

                <!-- Stats Cards -->
                <div class="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-8">
                    <Card :icon="checkIcon" :title="userStats.completedTasks.toString()" description="Tâches terminées"
                        layout="side" icon-color="text-green-500" />
                    <Card :icon="fireIcon" :title="userStats.streak.toString()" description="Jours de streak"
                        layout="side" icon-color="text-orange-600" />
                    <Card :icon="starIcon" :title="userStats.points.toString()" description="Points" layout="side"
                        icon-color="text-yellow-400" />
                </div>
            </div>

            <div class="w-full max-w-7xl mt-8">
                <PersonalKanban />
            </div>
        </template>

        <!-- Unauthenticated State -->
        <div v-else class="flex flex-col items-center space-y-4 mt-8">
            <p class="text-lg text-center">Connectez-vous pour commencer à gérer vos tâches et projets !</p>
            <div class="flex space-x-4">
                <button @click="navigateTo('/login')"
                    class="px-6 py-3 bg-accent text-white font-semibold rounded-lg shadow-md hover:bg-accent-dark transition-colors">
                    Connexion
                </button>
                <button @click="navigateTo('/register')"
                    class="px-6 py-3 border border-accent text-accent font-semibold rounded-lg shadow-md hover:bg-accent/10 transition-colors">
                    S'inscrire
                </button>
            </div>
        </div>
    </section>
</template>
<script setup lang="ts">
useHead({
    title: 'Accueil - Procrastinator',
    meta: [
        { name: 'description', content: 'Gérez vos tâches efficacement avec Procrastinator. Workspaces collaboratifs et suivi de productivité.' },
        { property: 'og:title', content: 'Procrastinator - Gestionnaire de Tâches' },
        { property: 'og:description', content: 'Gérez vos tâches efficacement avec Procrastinator.' },
    ],
})
import { ref, onMounted } from "vue";
import Card from "~/components/global/card.vue";
import UserLevelProgress from "~/components/gamification/UserLevelProgress.vue";
import fireIcon from "~/assets/icons/fire.svg";
import checkIcon from "~/assets/icons/check.svg";
import starIcon from "~/assets/icons/star.svg";
import PersonalKanban from "~/components/kanban/personalKanban.vue";
import { apiClient } from "~/utils/api";
import { useAuthStore } from '~/composables/useAuthStore';
import type { Badge } from "~/composables/useAuth";

const authStore = useAuthStore();
const isAuthenticated = authStore.isAuthenticated;
const isAuthCheckComplete = ref(false);

interface UserStats {
    completedTasks: number
    streak: number
    points: number
    level: number
    badges: Badge[]
}

// User statistics
const userStats = ref<UserStats>({
    completedTasks: 0,
    streak: 0,
    points: 0,
    level: 1,
    badges: []
});

// Load user statistics
const loadUserStats = async () => {
    if (!authStore.token.value) {
        return;
    }

    try {
        const response = await apiClient.get<any>("/api/auth/profile");
        if (response.success && response.data) {
            userStats.value = {
                completedTasks: response.data.completedTasks || 0,
                streak: response.data.streak || 0,
                points: response.data.points || 0,
                level: response.data.level || 1,
                badges: response.data.badges || []
            };
        } else {
            console.error("Failed to fetch user profile:", response.error || "Unknown error");
            userStats.value = { completedTasks: 0, streak: 0, points: 0, level: 1, badges: [] };
        }
    } catch (error) {
        console.error("Error loading user stats:", error);
        userStats.value = { completedTasks: 0, streak: 0, points: 0, level: 1, badges: [] };
    }
};

onMounted(async () => {
    await authStore.init();
    isAuthCheckComplete.value = true;
    if (isAuthenticated.value) {
        await loadUserStats();
    }
});
</script>
