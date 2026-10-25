// Cliente HTTP para el servicio REST: adjunta automáticamente "Authorization: Bearer <token>"
// y, si el servicio responde 401 (sin token, inválido o expirado), cierra la sesión y
// redirige a /login conservando la ruta actual para volver después de iniciar sesión.
export default defineNuxtPlugin((nuxtApp) => {
  const auth = useAuth()
  const router = useRouter()

  const api = $fetch.create({
    onRequest({ options }) {
      const token = auth.tokenVigente()
      if (token) {
        const headers = new Headers(options.headers as HeadersInit | undefined)
        headers.set('Authorization', `Bearer ${token}`)
        options.headers = headers
      }
    },
    onResponseError({ request, response }) {
      const url = typeof request === 'string' ? request : (request as Request).url
      if (response.status === 401 && !url.includes('/api/auth/')) {
        auth.cerrarSesion()
        const actual = router.currentRoute.value
        if (actual.path !== '/login') {
          nuxtApp.runWithContext(() =>
            navigateTo({ path: '/login', query: { redirect: actual.fullPath, expirada: '1' } })
          )
        }
      }
    }
  })

  return { provide: { api } }
})
