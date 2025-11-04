<script setup lang="ts">
import { computed } from 'vue';
import WorkspaceCard from "~/components/global/workspaceCard.vue";
import data from "../data.json";

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
      description: `${totalTasks} tâches dans cet espace`,
      totalTasks,
      completedTasks,
      users: wsUsers,
      tasks: wsTasks,
    };
  })
);
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2" >
    <NuxtLink
      v-for="ws in workspacesWithDetails"
      :key="ws.id"
      :to="`/workspace/${ws.id}`"
      class="block"
    >
      <WorkspaceCard
          :title="ws.title"
          :description="ws.description"
          :total-tasks="ws.totalTasks"
          :completed-tasks="ws.completedTasks"
          :users="ws.users"
      >
        <ul>
          <li v-for="task in ws.tasks" :key="task.id">
            {{ task.title }} - {{ task.status }} (Assigné à : {{
              data.users.find(u => u.id === task.assignedTo)?.firstName
            }})
          </li>
        </ul>
      </WorkspaceCard>
    </NuxtLink>
  </div>
</template>
