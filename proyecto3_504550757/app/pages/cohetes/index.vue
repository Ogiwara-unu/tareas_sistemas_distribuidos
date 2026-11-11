<script setup lang="ts">
const { $api } = useNuxtApp()
const auth = useAuth()

useHead({ title: 'Cohetes - Catálogo de misiones espaciales' })

const cohetes = ref<any[]>([])
const error = ref('')

const vacio = () => ({ nombre: '', fabricante: '', altura_m: '', masa_despegue_kg: '', imagen_url: '' })
const nuevoCohete = ref(vacio())

async function cargar() {
  try {
    cohetes.value = await $api('/api/cohetes')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Error cargando cohetes'
  }
}

async function crear() {
  error.value = ''
  try {
    await $api('/api/cohetes', { method: 'POST', body: nuevoCohete.value })
    nuevoCohete.value = vacio()
    await cargar()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Error creando el cohete'
  }
}

const stackItems = computed(() =>
  cohetes.value.map((c) => ({
    id: c.id,
    title: c.nombre,
    subtitle: c.fabricante,
    imageUrl: c.imagen_url,
    to: `/cohetes/${c.id}`,
    fallbackIcon: '🚀'
  }))
)

async function borrar(id: string | number) {
  if (!confirm('¿Borrar este cohete?')) return
  try {
    await $api(`/api/cohetes/${id}`, { method: 'DELETE' })
    await cargar()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'No se pudo borrar el cohete'
  }
}

onMounted(cargar)

const campos = [
  { key: 'nombre', label: 'Nombre', type: 'text' as const },
  { key: 'fabricante', label: 'Fabricante', type: 'text' as const },
  { key: 'altura_m', label: 'Altura (m)', type: 'number' as const },
  { key: 'masa_despegue_kg', label: 'Masa de despegue (kg)', type: 'number' as const },
  { key: 'imagen_url', label: 'URL de imagen', type: 'text' as const }
]
</script>

<template>
  <main class="page">
    <NuxtLink to="/" class="back-link">&larr; Volver al inicio</NuxtLink>
    <span class="eyebrow">🚀 Catálogo</span>
    <h1>Cohetes <em>espaciales</em></h1>
    <p v-if="error" class="error">{{ error }}</p>

    <CardStack :items="stackItems" :can-delete="auth.esAdmin.value" @delete="borrar" />

    <section v-if="auth.autenticado.value" class="form-panel">
      <h2>Nuevo cohete</h2>
      <form @submit.prevent="crear">
        <EntityForm v-model="nuevoCohete" :fields="campos" />
        <button type="submit">Crear cohete</button>
      </form>
    </section>
    <p v-else class="locked-note">
      <NuxtLink :to="{ path: '/login', query: { redirect: $route.fullPath } }">Inicia sesión</NuxtLink> o
      <NuxtLink to="/registro">crea una cuenta</NuxtLink> para agregar o editar registros.
    </p>
  </main>
</template>
