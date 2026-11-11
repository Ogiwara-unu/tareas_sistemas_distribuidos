<script setup lang="ts">
const auth = useAuth()
const route = useRoute()

const loginLink = computed(() =>
  ['/login', '/registro'].includes(route.path) ? '/login' : { path: '/login', query: { redirect: route.fullPath } }
)

async function salir() {
  auth.cerrarSesion()
  await navigateTo('/')
}
</script>

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
    <div v-if="auth.autenticado.value" class="nav-session">
      <span class="nav-user" :title="auth.usuario.value?.correo">
        {{ auth.usuario.value?.nombre }}
        <small>{{ auth.usuario.value?.rol }}</small>
      </span>
      <button type="button" class="nav-logout" @click="salir">Salir</button>
    </div>
    <NuxtLink v-else :to="loginLink" class="nav-cta">
      Ingresar <span aria-hidden="true">&rarr;</span>
    </NuxtLink>
  </header>
  <NuxtPage />
</template>
