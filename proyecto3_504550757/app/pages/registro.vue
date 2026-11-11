<script setup lang="ts">
useHead({ title: 'Registro - Catálogo de misiones espaciales' })

const route = useRoute()
const { $api } = useNuxtApp()
const auth = useAuth()

const form = ref({ nombre: '', correo: '', password: '', confirmar: '' })
const error = ref('')
const enviando = ref(false)

function destino() {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith('/') && !r.startsWith('//') ? r : '/misiones'
}

async function registrar() {
  error.value = ''
  if (form.value.password !== form.value.confirmar) {
    error.value = 'Las contraseñas no coinciden'
    return
  }
  enviando.value = true
  try {
    const { nombre, correo, password } = form.value
    const res: any = await $api('/api/auth/registro', { method: 'POST', body: { nombre, correo, password } })
    auth.iniciarSesion(res.token, res.usuario)
    await navigateTo(destino())
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'No se pudo completar el registro'
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <main class="page">
    <NuxtLink to="/" class="back-link">&larr; Volver al inicio</NuxtLink>
    <span class="eyebrow">🧑‍🚀 Nueva cuenta</span>
    <h1>Crear <em>cuenta</em></h1>
    <p v-if="error" class="error">{{ error }}</p>

    <section class="form-panel auth-panel">
      <form @submit.prevent="registrar">
        <label class="field field-full">
          <span>Nombre</span>
          <input v-model="form.nombre" type="text" autocomplete="name" required />
        </label>
        <label class="field field-full">
          <span>Correo</span>
          <input v-model="form.correo" type="email" autocomplete="email" required />
        </label>
        <label class="field">
          <span>Contraseña (mín. 8 caracteres)</span>
          <input v-model="form.password" type="password" autocomplete="new-password" minlength="8" required />
        </label>
        <label class="field">
          <span>Confirmar contraseña</span>
          <input v-model="form.confirmar" type="password" autocomplete="new-password" minlength="8" required />
        </label>
        <button type="submit" :disabled="enviando">{{ enviando ? 'Creando…' : 'Crear cuenta' }}</button>
      </form>
      <p class="muted auth-alt">
        ¿Ya tienes cuenta?
        <NuxtLink :to="{ path: '/login', query: route.query.redirect ? { redirect: route.query.redirect } : {} }">
          Inicia sesión
        </NuxtLink>
      </p>
    </section>
  </main>
</template>
