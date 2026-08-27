<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const agencia = ref<any>(null)
const editando = ref(false)
const error = ref('')

async function cargar() {
  agencia.value = await $fetch(`/api/agencias/${id}`)
}

async function guardar() {
  error.value = ''
  try {
    await $fetch(`/api/agencias/${id}`, { method: 'PUT', body: agencia.value })
    editando.value = false
    await cargar()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Error guardando la agencia'
  }
}

async function borrar() {
  if (!confirm('¿Borrar esta agencia?')) return
  try {
    await $fetch(`/api/agencias/${id}`, { method: 'DELETE' })
    router.push('/agencias')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'No se pudo borrar la agencia'
  }
}

onMounted(cargar)

useHead({ title: 'Agencia - Catálogo de misiones espaciales' })

const campos = [
  { key: 'nombre', label: 'Nombre', type: 'text' as const },
  { key: 'pais', label: 'País', type: 'text' as const },
  { key: 'anio_fundacion', label: 'Año de fundación', type: 'number' as const },
  { key: 'sitio_web', label: 'Sitio web', type: 'text' as const },
  { key: 'imagen_url', label: 'URL de imagen', type: 'text' as const }
]
</script>

<template>
  <main class="page" v-if="agencia">
    <NuxtLink to="/agencias">&larr; Volver a agencias</NuxtLink>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="!editando">
      <h1>{{ agencia.nombre }}</h1>

      <div class="detail">
        <img v-if="agencia.imagen_url" :src="agencia.imagen_url" :alt="agencia.nombre" />
        <div>
          <p><strong>País:</strong> {{ agencia.pais }}</p>
          <p><strong>Año de fundación:</strong> {{ agencia.anio_fundacion }}</p>
          <p v-if="agencia.sitio_web">
            <strong>Sitio web:</strong> <a :href="agencia.sitio_web" target="_blank" rel="noopener">{{ agencia.sitio_web }}</a>
          </p>

          <h3>Misiones de esta agencia</h3>
          <ul v-if="agencia.misiones?.length" class="related-list">
            <li v-for="m in agencia.misiones" :key="m.id">
              <NuxtLink :to="`/misiones/${m.id}`">{{ m.nombre }}</NuxtLink>
              — {{ m.fecha_lanzamiento }} ({{ m.estado }})
            </li>
          </ul>
          <p v-else class="muted">Sin misiones registradas todavía.</p>
        </div>
      </div>

      <div class="actions-row">
        <button @click="editando = true">Editar</button>
        <button class="danger" @click="borrar">Borrar</button>
      </div>
    </div>

    <form v-else @submit.prevent="guardar">
      <EntityForm v-model="agencia" :fields="campos" />
      <div class="actions-row">
        <button type="submit">Guardar</button>
        <button type="button" class="secondary" @click="editando = false">Cancelar</button>
      </div>
    </form>
  </main>
</template>
