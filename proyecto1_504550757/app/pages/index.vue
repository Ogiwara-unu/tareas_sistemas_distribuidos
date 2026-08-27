<script setup lang="ts">
useHead({ title: 'Catálogo de misiones espaciales' })
</script>

<template>
  <main class="page">
    <h1>🚀 Catálogo de misiones espaciales</h1>
    <p class="muted">Proyecto 1 — Sistemas Distribuidos. Explora misiones, agencias espaciales y cohetes.</p>

    <div class="home-grid">
      <NuxtLink to="/misiones" class="home-card">🛰️ Misiones</NuxtLink>
      <NuxtLink to="/agencias" class="home-card">🏛️ Agencias</NuxtLink>
      <NuxtLink to="/cohetes" class="home-card">🚀 Cohetes</NuxtLink>
    </div>
  </main>
</template>
