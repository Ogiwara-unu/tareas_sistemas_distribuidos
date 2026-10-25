// Estado de sesión del cliente. La app es una SPA (ssr: false), así que el estado puede
// vivir a nivel de módulo y persistirse en localStorage.
type Usuario = { id: string; nombre: string; correo: string; rol: 'admin' | 'editor' }

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_usuario'

const token = ref<string | null>(null)
const usuario = ref<Usuario | null>(null)
let cargado = false

// Lee la fecha de expiración (exp, en segundos) del payload del JWT.
function expiracion(jwt: string): number | null {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

function cargarDeStorage() {
  if (cargado || typeof window === 'undefined') return
  cargado = true
  try {
    const t = localStorage.getItem(TOKEN_KEY)
    const u = localStorage.getItem(USER_KEY)
    const exp = t ? expiracion(t) : null
    if (t && u && exp && exp > Date.now()) {
      token.value = t
      usuario.value = JSON.parse(u)
    } else {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  } catch {
    // localStorage no disponible: la sesión solo dura mientras la pestaña esté abierta
  }
}

export function useAuth() {
  cargarDeStorage()

  function iniciarSesion(nuevoToken: string, nuevoUsuario: Usuario) {
    token.value = nuevoToken
    usuario.value = nuevoUsuario
    try {
      localStorage.setItem(TOKEN_KEY, nuevoToken)
      localStorage.setItem(USER_KEY, JSON.stringify(nuevoUsuario))
    } catch {}
  }

  function cerrarSesion() {
    token.value = null
    usuario.value = null
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch {}
  }

  // Si el token ya expiró en el cliente se descarta antes de enviarlo.
  function tokenVigente(): string | null {
    if (!token.value) return null
    const exp = expiracion(token.value)
    if (!exp || exp <= Date.now()) {
      cerrarSesion()
      return null
    }
    return token.value
  }

  const autenticado = computed(() => !!usuario.value && !!token.value)
  const esAdmin = computed(() => usuario.value?.rol === 'admin')

  return {
    token: readonly(token),
    usuario: readonly(usuario),
    autenticado,
    esAdmin,
    iniciarSesion,
    cerrarSesion,
    tokenVigente
  }
}
