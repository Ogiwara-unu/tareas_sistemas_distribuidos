<script setup lang="ts">
useHead({ title: 'Misiones - Catálogo de misiones espaciales' })

const misiones = ref<any[]>([])
const agencias = ref<any[]>([])
const cohetes = ref<any[]>([])
const error = ref('')

const vacio = () => ({
  nombre: '',
  fecha_lanzamiento: '',
  destino: '',
  estado: 'planificada',
  descripcion: '',
  imagen_url: '',
  agencia_id: '',
  cohete_id: ''
})
const nuevaMision = ref(vacio())

async function cargar() {
  try {
    misiones.value = await $fetch('/api/misiones')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Error cargando misiones'
  }
}

async function cargarListas() {
  agencias.value = await $fetch('/api/agencias')
  cohetes.value = await $fetch('/api/cohetes')
}

async function crear() {
  error.value = ''
  try {
    await $fetch('/api/misiones', { method: 'POST', body: nuevaMision.value })
    nuevaMision.value = vacio()
    await cargar()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Error creando la misión'
  }
}

async function borrar(id: number) {
  if (!confirm('¿Borrar esta misión?')) return
  await $fetch(`/api/misiones/${id}`, { method: 'DELETE' })
  await cargar()
}

onMounted(() => {
  cargar()
  cargarListas()
})

const campos = computed(() => [
  { key: 'nombre', label: 'Nombre', type: 'text' as const },
  { key: 'fecha_lanzamiento', label: 'Fecha de lanzamiento', type: 'date' as const },
  { key: 'destino', label: 'Destino', type: 'text' as const },
  {
    key: 'estado',
    label: 'Estado',
    type: 'select' as const,
    options: [
      { value: 'planificada', label: 'Planificada' },
      { value: 'en curso', label: 'En curso' },
      { value: 'completada', label: 'Completada' },
      { value: 'fallida', label: 'Fallida' }
    ]
  },
  { key: 'descripcion', label: 'Descripción', type: 'textarea' as const },
  { key: 'imagen_url', label: 'URL de imagen', type: 'text' as const },
  {
    key: 'agencia_id',
    label: 'Agencia',
    type: 'select' as const,
    options: agencias.value.map((a) => ({ value: a.id, label: a.nombre }))
  },
  {
    key: 'cohete_id',
    label: 'Cohete',
    type: 'select' as const,
    options: cohetes.value.map((c) => ({ value: c.id, label: c.nombre }))
  }
])
</script>

<template>
  <main class="page">
    <NuxtLink to="/">&larr; Volver al inicio</NuxtLink>
    <h1>🛰️ Misiones espaciales</h1>
    <p v-if="error" class="error">{{ error }}</p>

    <ul class="cards">
      <li v-for="m in misiones" :key="m.id">
        <NuxtLink :to="`/misiones/${m.id}`" class="card">
          <img v-if="m.imagen_url" :src="m.imagen_url" :alt="m.nombre" />
          <h3>{{ m.nombre }}</h3>
          <p class="muted">{{ m.fecha_lanzamiento }} · {{ m.destino }}</p>
          <span class="tag">{{ m.estado }}</span>
          <p class="muted">{{ m.agencia_nombre }} · {{ m.cohete_nombre }}</p>
        </NuxtLink>
        <button class="danger" @click="borrar(m.id)">Borrar</button>
      </li>
    </ul>

    <h2>Nueva misión</h2>
    <form @submit.prevent="crear">
      <EntityForm v-model="nuevaMision" :fields="campos" />
      <button type="submit">Crear misión</button>
    </form>
  </main>
</template>
