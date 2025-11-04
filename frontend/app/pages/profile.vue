<script setup lang="ts">
import Card from "~/components/global/card.vue";
import fireIcon from "~/assets/icons/fire.svg";
import checkIcon from "~/assets/icons/check.svg";
import starIcon from "~/assets/icons/star.svg";

import { getLevelFromPoints, getNextLevelPoints } from "~/utils/levelSystem";

import data from "../data.json"
const user = data.users[0];

useHead({ title: 'Profil' })
</script>

<template >
  <section class="space-y-6 bg-primary min-h-screen text-text">
    <div class="space-y-4" >
      <h1 class="text-3xl font-bold">Votre profil, {{ user?.firstName }}</h1>
      <p>Niveau {{ getLevelFromPoints(user?.points) }}</p>
      <p v-if="user?.points">
        {{ user.points }} pts • Prochain palier: {{ getNextLevelPoints(getLevelFromPoints(user.points) + 1) }} pts
      </p>
    </div>
    <div class="space-y-4">
      <h3>Statistiques</h3>
      <div class="grid gap-4 sm:grid-cols-3">
        <Card :icon="checkIcon" :title="user?.completedTasks" description="Tâches terminées" />
        <Card :icon="fireIcon" :title="user?.streak" description="Jours de streak" />
        <Card :icon="starIcon" title="titi" description="Niveau" />
      </div>
    </div>
    <div class="space-y-4">
      <h3>Badges</h3>
      <div class="grid gap-4 sm:grid-cols-6">
        <Card :icon="checkIcon" title="1247" description="Tâches terminées" />
        <Card :icon="fireIcon" title="74" description="Jours de streak" />
        <Card :icon="starIcon" title="titi" description="Niveau" />
        <Card :icon="checkIcon" title="1247" description="Tâches terminées" />
        <Card :icon="fireIcon" title="74" description="Jours de streak" />
        <Card :icon="starIcon" title="titi" description="Niveau" />
        <Card :icon="checkIcon" title="1247" description="Tâches terminées" />
        <Card :icon="fireIcon" title="74" description="Jours de streak" />
        <Card :icon="starIcon" title="titi" description="Niveau" />
      </div>
    </div>
    <div class="rounded-lg border border-white/10 bg-secondary p-6 space-y-4" >
      <h3>Paramètres</h3>
      <div>
        <h4>Apparence</h4>
        <div class="flex gap-4 justify-between items-center" >
          <p>Thème</p>
          <div class="flex gap-2" >
            <button class="bg-accent text-secondary font-medium py-2 px-4 rounded-md cursor-pointer">Sombre</button>
            <button class="bg-white/10 text-white font-medium py-2 px-4 rounded-md ml-2 cursor-pointer">Clair</button>
            <button class="bg-white/10 text-white font-medium py-2 px-4 rounded-md ml-2 cursor-pointer">Système</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
