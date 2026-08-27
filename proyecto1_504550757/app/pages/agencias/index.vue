<script setup lang="ts">
useHead({ title: 'Agencias - Catálogo de misiones espaciales' })

const agencias = ref<any[]>([])
const error = ref('')

const vacio = () => ({ nombre: '', pais: '', anio_fundacion: '', sitio_web: '', imagen_url: '' })
const nuevaAgencia = ref(vacio())

async function cargar() {
  try {
    agencias.value = await $fetch('/api/agencias')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Error cargando agencias'
  }
}

async function crear() {
  error.value = ''
  try {
    await $fetch('/api/agencias', { method: 'POST', body: nuevaAgencia.value })
    nuevaAgencia.value = vacio()
    await cargar()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Error creando la agencia'
  }
}

const stackItems = computed(() =>
  agencias.value.map((a) => ({
    id: a.id,
    title: a.nombre,
    subtitle: `${a.pais} · fundada en ${a.anio_fundacion}`,
    imageUrl: a.imagen_url,
    to: `/agencias/${a.id}`,
    fallbackIcon: '🏛️'
  }))
)

async function borrar(id: number) {
  if (!confirm('¿Borrar esta agencia?')) return
  try {
    await $fetch(`/api/agencias/${id}`, { method: 'DELETE' })
    await cargar()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'No se pudo borrar la agencia'
  }
}

onMounted(cargar)

const campos = [
  { key: 'nombre', label: 'Nombre', type: 'text' as const },
  { key: 'pais', label: 'País', type: 'text' as const },
  { key: 'anio_fundacion', label: 'Año de fundación', type: 'number' as const },
  { key: 'sitio_web', label: 'Sitio web', type: 'text' as const },
  { key: 'imagen_url', label: 'URL de imagen', type: 'text' as const }
]
</script>

<template>
  <main class="page">
    <NuxtLink to="/" class="back-link">&larr; Volver al inicio</NuxtLink>
    <span class="eyebrow">🏛️ Catálogo</span>
    <h1>Agencias <em>espaciales</em></h1>
    <p v-if="error" class="error">{{ error }}</p>

    <CardStack :items="stackItems" @delete="borrar" />

    <section class="form-panel">
      <h2>Nueva agencia</h2>
      <form @submit.prevent="crear">
        <EntityForm v-model="nuevaAgencia" :fields="campos" />
        <button type="submit">Crear agencia</button>
      </form>
    </section>
  </main>
</template>
