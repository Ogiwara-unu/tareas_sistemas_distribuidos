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

const stackItems = computed(() =>
  misiones.value.map((m) => ({
    id: m.id,
    title: m.nombre,
    subtitle: `${m.fecha_lanzamiento} · ${m.destino}`,
    imageUrl: m.imagen_url,
    to: `/misiones/${m.id}`,
    fallbackIcon: '🛰️',
    badge: m.estado,
    badgeClass: `tag tag-${String(m.estado).replace(' ', '-')}`
  }))
)

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
    <NuxtLink to="/" class="back-link">&larr; Volver al inicio</NuxtLink>
    <span class="eyebrow">🛰️ Catálogo</span>
    <h1>Misiones <em>espaciales</em></h1>
    <p v-if="error" class="error">{{ error }}</p>

    <CardStack :items="stackItems" @delete="borrar" />

    <section class="form-panel">
      <h2>Nueva misión</h2>
      <form @submit.prevent="crear">
        <EntityForm v-model="nuevaMision" :fields="campos" />
        <button type="submit">Crear misión</button>
      </form>
    </section>
  </main>
</template>
