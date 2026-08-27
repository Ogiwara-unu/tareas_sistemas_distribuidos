<template>
  <NuxtRouteAnnouncer />
  <header class="app-nav">
    <NuxtLink to="/" class="nav-brand">
      <span class="nav-brand-mark">🚀</span>
      <span class="nav-brand-text">Misiones ES</span>
    </NuxtLink>
    <nav class="nav-links">
      <NuxtLink to="/misiones" active-class="nav-link-active">Misiones</NuxtLink>
      <NuxtLink to="/agencias" active-class="nav-link-active">Agencias</NuxtLink>
      <NuxtLink to="/cohetes" active-class="nav-link-active">Cohetes</NuxtLink>
    </nav>
    <NuxtLink to="/misiones" class="nav-cta">Explorar <span aria-hidden="true">&rarr;</span></NuxtLink>
  </header>
  <NuxtPage />
</template>
