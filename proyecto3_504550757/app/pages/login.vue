<script setup lang="ts">
useHead({ title: 'Iniciar sesión - Catálogo de misiones espaciales' })

const route = useRoute()
const { $api } = useNuxtApp()
const auth = useAuth()

const form = ref({ correo: '', password: '' })
const error = ref('')
const enviando = ref(false)
const expirada = computed(() => route.query.expirada === '1')

function destino() {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith('/') && !r.startsWith('//') ? r : '/misiones'
}

async function entrar() {
  error.value = ''
  enviando.value = true
  try {
    const res: any = await $api('/api/auth/login', { method: 'POST', body: form.value })
    auth.iniciarSesion(res.token, res.usuario)
    await navigateTo(destino())
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'No se pudo iniciar sesión'
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <main class="page">
    <NuxtLink to="/" class="back-link">&larr; Volver al inicio</NuxtLink>
    <span class="eyebrow">🔐 Acceso</span>
    <h1>Iniciar <em>sesión</em></h1>
    <p v-if="expirada && !error" class="error">Tu sesión expiró o no es válida. Inicia sesión de nuevo.</p>
    <p v-if="error" class="error">{{ error }}</p>

    <section class="form-panel auth-panel">
      <form @submit.prevent="entrar">
        <label class="field field-full">
          <span>Correo</span>
          <input v-model="form.correo" type="email" autocomplete="email" required />
        </label>
        <label class="field field-full">
          <span>Contraseña</span>
          <input v-model="form.password" type="password" autocomplete="current-password" required />
        </label>
        <button type="submit" :disabled="enviando">{{ enviando ? 'Entrando…' : 'Entrar' }}</button>
      </form>
      <p class="muted auth-alt">
        ¿No tienes cuenta?
        <NuxtLink :to="{ path: '/registro', query: route.query.redirect ? { redirect: route.query.redirect } : {} }">
          Regístrate
        </NuxtLink>
      </p>
    </section>
  </main>
</template>
