<script setup lang="ts">
const { $api } = useNuxtApp()
const auth = useAuth()

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const mision = ref<any>(null)
const agencias = ref<any[]>([])
const cohetes = ref<any[]>([])
const editando = ref(false)
const error = ref('')

async function cargar() {
  mision.value = await $api(`/api/misiones/${id}`)
}

async function cargarListas() {
  agencias.value = await $api('/api/agencias')
  cohetes.value = await $api('/api/cohetes')
}

async function guardar() {
  error.value = ''
  try {
    await $api(`/api/misiones/${id}`, { method: 'PUT', body: mision.value })
    editando.value = false
    await cargar()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Error guardando la misión'
  }
}

async function borrar() {
  if (!confirm('¿Borrar esta misión?')) return
  try {
    await $api(`/api/misiones/${id}`, { method: 'DELETE' })
    router.push('/misiones')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'No se pudo borrar la misión'
  }
}

onMounted(() => {
  cargar()
  cargarListas()
})

useHead({ title: 'Misión - Catálogo de misiones espaciales' })

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
  <main class="page" v-if="mision">
    <NuxtLink to="/misiones" class="back-link">&larr; Volver a misiones</NuxtLink>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="!editando">
      <h1>{{ mision.nombre }}</h1>
      <span :class="['tag', `tag-${mision.estado.replace(' ', '-')}`]">{{ mision.estado }}</span>

      <div class="detail">
        <div class="detail-media">
          <img v-if="mision.imagen_url" :src="mision.imagen_url" :alt="mision.nombre" />
        </div>
        <div class="detail-info">
          <p class="spec-row"><strong>Fecha de lanzamiento</strong> {{ mision.fecha_lanzamiento }}</p>
          <p class="spec-row"><strong>Destino</strong> {{ mision.destino }}</p>
          <p class="spec-row">
            <strong>Agencia</strong>
            <NuxtLink :to="`/agencias/${mision.agencia_id}`">{{ mision.agencia_nombre }}</NuxtLink>
          </p>
          <p class="spec-row">
            <strong>Cohete</strong>
            <NuxtLink :to="`/cohetes/${mision.cohete_id}`">{{ mision.cohete_nombre }}</NuxtLink>
          </p>
          <p v-if="mision.descripcion" class="detail-desc">{{ mision.descripcion }}</p>
        </div>
      </div>

      <div v-if="auth.autenticado.value" class="actions-row">
        <button @click="editando = true">Editar</button>
        <button v-if="auth.esAdmin.value" class="danger" @click="borrar">Borrar</button>
      </div>
    </div>

    <section v-else class="form-panel">
      <h2>Editar misión</h2>
      <form @submit.prevent="guardar">
        <EntityForm v-model="mision" :fields="campos" />
        <div class="actions-row">
          <button type="submit">Guardar</button>
          <button type="button" class="secondary" @click="editando = false">Cancelar</button>
        </div>
      </form>
    </section>
  </main>
</template>
