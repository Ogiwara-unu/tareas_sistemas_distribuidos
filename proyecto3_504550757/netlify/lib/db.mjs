import { createClient } from 'redis'
import { HttpError } from './http.mjs'

// Modelo en Redis:
//   - Cada entidad es un HASH (misiones, agencias, cohetes, usuarios).
//   - Cada registro es un valor de ese hash: campo = id, valor = registro en JSON.
//   - Los ids son propios (enteros como string) y se generan con INCR sobre "seq:<entidad>".
//   - Las relaciones se guardan como referencias por id (misión.agencia_id -> agencias[id]).

// El cliente se guarda a nivel de módulo: Netlify reutiliza el mismo contenedor entre
// invocaciones "calientes", así que la conexión a Redis Cloud se abre una sola vez y se reutiliza.
let clientPromise = null

export async function getRedis() {
  const url = process.env.REDIS_URL
  if (!url) {
    throw new HttpError(500, 'Falta la variable de entorno REDIS_URL')
  }
  if (!clientPromise) {
    const client = createClient({
      url,
      socket: { connectTimeout: 8000, reconnectStrategy: (retries) => (retries > 3 ? false : 200) }
    })
    // Sin este listener un error de socket tumbaría el proceso de la función.
    client.on('error', (err) => console.error('Redis:', err.message))
    clientPromise = client.connect().catch((err) => {
      clientPromise = null
      throw err
    })
  }
  const client = await clientPromise
  if (!client.isReady) {
    // La conexión guardada se cerró (por ejemplo, el contenedor estuvo inactivo): se abre otra.
    clientPromise = null
    return getRedis()
  }
  return client
}

const ID_RE = /^[1-9]\d*$/

// Valida un id de la URL; si no tiene el formato correcto se trata como "no encontrado".
export function checkId(id, notFoundMessage = 'Recurso no encontrado') {
  if (typeof id !== 'string' || !ID_RE.test(id)) throw new HttpError(404, notFoundMessage)
  return id
}

// Igual que checkId, pero para referencias enviadas en el cuerpo (400 en vez de 404).
export function checkRefId(id, field) {
  const value = String(id ?? '')
  if (!ID_RE.test(value)) throw new HttpError(400, `${field} no existe`)
  return value
}

const parse = (raw) => (raw == null ? null : JSON.parse(raw))

// Operaciones CRUD sobre una entidad guardada como hash de Redis.
export function repo(redis, entidad) {
  return {
    async list() {
      return (await redis.hVals(entidad)).map(parse)
    },

    async get(id) {
      return parse(await redis.hGet(entidad, id))
    },

    async exists(id) {
      return Boolean(await redis.hExists(entidad, id))
    },

    async create(data) {
      const id = String(await redis.incr(`seq:${entidad}`))
      const registro = { id, ...data }
      await redis.hSet(entidad, id, JSON.stringify(registro))
      return registro
    },

    // Actualización parcial (como el UPDATE ... SET del Proyecto 1). Devuelve null si no existe.
    async update(id, cambios) {
      const actual = parse(await redis.hGet(entidad, id))
      if (!actual) return null
      const registro = { ...actual, ...cambios, id }
      await redis.hSet(entidad, id, JSON.stringify(registro))
      return registro
    },

    async remove(id) {
      return (await redis.hDel(entidad, id)) > 0
    }
  }
}

export const porNombre = (a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es')
export const porFecha = (a, b) => String(a.fecha_lanzamiento).localeCompare(String(b.fecha_lanzamiento))
