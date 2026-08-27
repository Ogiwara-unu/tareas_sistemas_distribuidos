<script setup lang="ts">
useHead({ title: 'Cohetes - Catálogo de misiones espaciales' })

const cohetes = ref<any[]>([])
const error = ref('')

const vacio = () => ({ nombre: '', fabricante: '', altura_m: '', masa_despegue_kg: '', imagen_url: '' })
const nuevoCohete = ref(vacio())

async function cargar() {
  try {
    cohetes.value = await $fetch('/api/cohetes')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Error cargando cohetes'
  }
}

async function crear() {
  error.value = ''
  try {
    await $fetch('/api/cohetes', { method: 'POST', body: nuevoCohete.value })
    nuevoCohete.value = vacio()
    await cargar()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Error creando el cohete'
  }
}

async function borrar(id: number) {
  if (!confirm('¿Borrar este cohete?')) return
  try {
    await $fetch(`/api/cohetes/${id}`, { method: 'DELETE' })
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
    <NuxtLink to="/">&larr; Volver al inicio</NuxtLink>
    <h1>🚀 Cohetes</h1>
    <p v-if="error" class="error">{{ error }}</p>

    <ul class="cards">
      <li v-for="c in cohetes" :key="c.id">
        <NuxtLink :to="`/cohetes/${c.id}`" class="card">
          <img v-if="c.imagen_url" :src="c.imagen_url" :alt="c.nombre" />
          <h3>{{ c.nombre }}</h3>
          <p class="muted">{{ c.fabricante }}</p>
          <p class="muted">{{ c.altura_m }} m · {{ c.masa_despegue_kg }} kg</p>
        </NuxtLink>
        <button class="danger" @click="borrar(c.id)">Borrar</button>
      </li>
    </ul>

    <h2>Nuevo cohete</h2>
    <form @submit.prevent="crear">
      <EntityForm v-model="nuevoCohete" :fields="campos" />
      <button type="submit">Crear cohete</button>
    </form>
  </main>
</template>
