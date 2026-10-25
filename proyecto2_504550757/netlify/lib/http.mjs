// Error con código HTTP. El cuerpo de error mantiene el formato del Proyecto 1
// ({ statusCode, statusMessage }) para que el frontend no tenga que cambiar.
export class HttpError extends Error {
  constructor(statusCode, statusMessage) {
    super(statusMessage)
    this.statusCode = statusCode
    this.statusMessage = statusMessage
  }
}

export function json(data, status = 200) {
  return Response.json(data, { status })
}

export async function readBody(req) {
  try {
    return await req.json()
  } catch {
    return {}
  }
}

// Envuelve un handler para traducir HttpError (y errores inesperados) a respuestas JSON.
export function handler(fn) {
  return async (req, context) => {
    try {
      return await fn(req, context)
    } catch (err) {
      if (err instanceof HttpError) {
        return json({ statusCode: err.statusCode, statusMessage: err.statusMessage }, err.statusCode)
      }
      console.error(err)
      return json({ statusCode: 500, statusMessage: 'Error interno del servidor' }, 500)
    }
  }
}

// Obtiene el ":id" de /api/<recurso>/:id. netlify.toml reescribe /api/<recurso>/* hacia
// /.netlify/functions/<recurso>/*, así que se aceptan ambos prefijos.
// Devuelve null para /api/<recurso> y lanza 404 si la ruta tiene segmentos de más.
export function routeId(req, recurso) {
  const path = new URL(req.url).pathname.replace(/\/+$/, '')
  for (const base of [`/api/${recurso}`, `/.netlify/functions/${recurso}`]) {
    if (path === base) return null
    if (path.startsWith(base + '/')) {
      const rest = path.slice(base.length + 1).split('/')
      if (rest.length !== 1) break
      return decodeURIComponent(rest[0])
    }
  }
  throw new HttpError(404, 'Ruta no encontrada')
}

export function methodNotAllowed() {
  return new HttpError(405, 'Método no permitido')
}
