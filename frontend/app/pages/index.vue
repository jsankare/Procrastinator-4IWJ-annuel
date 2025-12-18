<template>
  <section class="space-y-6 bg-primary min-h-screen text-text">
    <h1 class="text-3xl font-bold">Procrastinator</h1>
    <p class="text-white/80 max-w-prose">
      Cette page a le layout de base avec la top navbar
    </p>

    <div class="grid gap-4 sm:grid-cols-3">
      <Card :icon="checkIcon" title="1247" description="Tâches terminées" layout="side" icon-color="text-green-500" />
      <Card :icon="fireIcon" title="74" description="Jours de streak" layout="side" icon-color="text-orange-600" />
      <Card :icon="starIcon" title="77" description="Niveau" layout="side" icon-color="text-yellow-400" />
    </div>

    <Kanban :user-id="currentUserId" />
  </section>
</template>
<script setup lang="ts">
  import Card from "~/components/global/card.vue"
  import fireIcon from "~/assets/icons/fire.svg"
  import checkIcon from "~/assets/icons/check.svg"
  import starIcon from "~/assets/icons/star.svg"
  import Kanban from "~/components/kanban/kanban.vue"
  import data from "~/data.json"

  const currentUserId = data.users[0].id
</script>