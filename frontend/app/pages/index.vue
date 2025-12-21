<template>
  <section class="space-y-8 bg-primary min-h-screen text-text flex flex-col items-center px-2 sm:px-0">
    <h1 class="text-2xl sm:text-3xl font-bold text-center mt-8">Procrastinator</h1>
    <p class="text-white/80 max-w-prose text-center mb-4">Cette page a le layout de base avec la top navbar</p>

    <div class="w-full max-w-3xl">
      <h2 class="text-lg sm:text-xl font-semibold mb-3 text-center sm:text-left">Statistiques</h2>
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card :icon="checkIcon" title="1247" description="Tâches terminées" layout="side" icon-color="text-green-500" />
        <Card :icon="fireIcon" title="74" description="Jours de streak" layout="side" icon-color="text-orange-600" />
        <Card :icon="starIcon" title="77" description="Niveau" layout="side" icon-color="text-yellow-400" />
      </div>
    </div>

    <div class="w-full max-w-3xl mt-8">
      <Kanban :user-id="currentUserId" />
    </div>
  </section>
</template>
<script setup lang="ts">
  import Card from "~/components/global/card.vue"
  import fireIcon from "~/assets/icons/fire.svg"
  import checkIcon from "~/assets/icons/check.svg"
  import starIcon from "~/assets/icons/star.svg"
  import Kanban from "~/components/kanban/kanban.vue"
  import data from "~/data.json"

  const currentUserId: number | undefined = Array.isArray(data.users) && data.users.length > 0 ? data.users[0]?.id : undefined
</script>