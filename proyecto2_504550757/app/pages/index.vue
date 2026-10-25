<script setup lang="ts">
useHead({ title: 'Catálogo de misiones espaciales' })
</script>

<template>
  <div class="hero">
    <ShaderLines />
    <div class="hero-inner">
      <div class="hero-top">
        <h1 class="hero-headline">Explora el<br /><em>cosmos</em></h1>
        <div class="hero-note">
          <p>Catálogo de misiones, agencias y cohetes espaciales. Proyecto de Sistemas Distribuidos.</p>
        </div>
      </div>
      <div class="hero-bottom">
        <div class="hero-categories">
          <span class="hero-label">Explora</span>
          <nav class="hero-links">
            <NuxtLink to="/misiones">Misiones</NuxtLink>
            <span>/</span>
            <NuxtLink to="/agencias">Agencias</NuxtLink>
            <span>/</span>
            <NuxtLink to="/cohetes">Cohetes</NuxtLink>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>
