<template>
  <div class="flex flex-col gap-6 bg-primary text-text" >
    <div>
      <h1 class="text-3xl font-bold">Vos Workspaces</h1>
      <p class="text-text/70">Sélectionnez un espace pour accéder au board et au leaderboard associé.</p>
    </div>
    <div class="flex gap-3">
      <Button content="Rejoindre un workspace" :icon="usersIcon" />
      <Button content="Créer un workspace" :icon="plusIcon" />
    </div>
    <div class="grid gap-4 sm:grid-cols-2">
      <NuxtLink v-for="ws in workspacesWithDetails" :key="ws.id" :to="`/workspace/${ws.id}`" class="block">
        <WorkspaceCard
            :title="ws.title"
            :description="ws.description"
            :total-tasks="ws.totalTasks"
            :completed-tasks="ws.completedTasks"
            :users="ws.users"
        >
        </WorkspaceCard>
      </NuxtLink>
    </div>

  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import WorkspaceCard from "~/components/global/workspaceCard.vue";
import data from "../data.json";
import Button from "~/components/global/button.vue";
import plusIcon from "~/assets/icons/plus.svg";
import usersIcon from "~/assets/icons/users.svg";

// Assume current user is the first one in data.json
const currentUserId = data.users[0]?.id ?? 1;

const userWorkspaces = computed(() => {
  return data.workspaces.filter(ws => ws.members.includes(currentUserId));
});

const workspacesWithDetails = computed(() =>
    userWorkspaces.value.map(ws => {
      const wsUsers = ws.members
          .map(id => data.users.find(u => u.id === id))
          .filter(Boolean)
          .map(u => `${u!.firstName} ${u!.lastName}`);

      const wsTasks = data.tasks.filter(task => task.workspaceId === ws.id);

      const totalTasks = wsTasks.length;
      const completedTasks = wsTasks.filter(t => (t.status || '').toLowerCase() === 'terminé').length;

      return {
        id: ws.id,
        title: ws.name,
        description: ws.description,
        totalTasks,
        completedTasks,
        users: wsUsers,
        tasks: wsTasks,
      };
    })
);
</script>