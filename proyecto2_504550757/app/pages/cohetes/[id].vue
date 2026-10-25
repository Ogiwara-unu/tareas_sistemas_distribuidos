<script setup lang="ts">
const { $api } = useNuxtApp()
const auth = useAuth()

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const cohete = ref<any>(null)
const editando = ref(false)
const error = ref('')

async function cargar() {
  cohete.value = await $api(`/api/cohetes/${id}`)
}

async function guardar() {
  error.value = ''
  try {
    await $api(`/api/cohetes/${id}`, { method: 'PUT', body: cohete.value })
    editando.value = false
    await cargar()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Error guardando el cohete'
  }
}

async function borrar() {
  if (!confirm('¿Borrar este cohete?')) return
  try {
    await $api(`/api/cohetes/${id}`, { method: 'DELETE' })
    router.push('/cohetes')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'No se pudo borrar el cohete'
  }
}

onMounted(cargar)

useHead({ title: 'Cohete - Catálogo de misiones espaciales' })

const campos = [
  { key: 'nombre', label: 'Nombre', type: 'text' as const },
  { key: 'fabricante', label: 'Fabricante', type: 'text' as const },
  { key: 'altura_m', label: 'Altura (m)', type: 'number' as const },
  { key: 'masa_despegue_kg', label: 'Masa de despegue (kg)', type: 'number' as const },
  { key: 'imagen_url', label: 'URL de imagen', type: 'text' as const }
]
</script>

<template>
  <main class="page" v-if="cohete">
    <NuxtLink to="/cohetes" class="back-link">&larr; Volver a cohetes</NuxtLink>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="!editando">
      <h1>{{ cohete.nombre }}</h1>

      <div class="detail">
        <div class="detail-media">
          <img v-if="cohete.imagen_url" :src="cohete.imagen_url" :alt="cohete.nombre" />
        </div>
        <div class="detail-info">
          <p class="spec-row"><strong>Fabricante</strong> {{ cohete.fabricante }}</p>
          <p class="spec-row"><strong>Altura</strong> {{ cohete.altura_m }} m</p>
          <p class="spec-row"><strong>Masa de despegue</strong> {{ cohete.masa_despegue_kg }} kg</p>

          <h3>Misiones que usaron este cohete</h3>
          <ul v-if="cohete.misiones?.length" class="related-list">
            <li v-for="m in cohete.misiones" :key="m.id">
              <NuxtLink :to="`/misiones/${m.id}`">{{ m.nombre }}</NuxtLink>
              <span>{{ m.fecha_lanzamiento }} &middot; {{ m.estado }}</span>
            </li>
          </ul>
          <p v-else class="muted">Sin misiones registradas todavía.</p>
        </div>
      </div>

      <div v-if="auth.autenticado.value" class="actions-row">
        <button @click="editando = true">Editar</button>
        <button v-if="auth.esAdmin.value" class="danger" @click="borrar">Borrar</button>
      </div>
    </div>

    <section v-else class="form-panel">
      <h2>Editar cohete</h2>
      <form @submit.prevent="guardar">
        <EntityForm v-model="cohete" :fields="campos" />
        <div class="actions-row">
          <button type="submit">Guardar</button>
          <button type="button" class="secondary" @click="editando = false">Cancelar</button>
        </div>
      </form>
    </section>
  </main>
</template>
