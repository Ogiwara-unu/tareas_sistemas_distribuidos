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
    <NuxtLink to="/">&larr; Volver al inicio</NuxtLink>
    <h1>🏛️ Agencias espaciales</h1>
    <p v-if="error" class="error">{{ error }}</p>

    <ul class="cards">
      <li v-for="a in agencias" :key="a.id">
        <NuxtLink :to="`/agencias/${a.id}`" class="card">
          <img v-if="a.imagen_url" :src="a.imagen_url" :alt="a.nombre" />
          <h3>{{ a.nombre }}</h3>
          <p class="muted">{{ a.pais }} · fundada en {{ a.anio_fundacion }}</p>
        </NuxtLink>
        <button class="danger" @click="borrar(a.id)">Borrar</button>
      </li>
    </ul>

    <h2>Nueva agencia</h2>
    <form @submit.prevent="crear">
      <EntityForm v-model="nuevaAgencia" :fields="campos" />
      <button type="submit">Crear agencia</button>
    </form>
  </main>
</template>
