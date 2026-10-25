import { MongoClient, ObjectId } from 'mongodb'
import { HttpError } from './http.mjs'

// El cliente se guarda a nivel de módulo: Netlify reutiliza el mismo contenedor entre
// invocaciones "calientes", así que la conexión a Atlas se abre una sola vez y se reutiliza.
let clientPromise = null

export async function getDb() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new HttpError(500, 'Falta la variable de entorno MONGODB_URI')
  }
  if (!clientPromise) {
    const client = new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 8000 })
    clientPromise = client.connect().catch((err) => {
      clientPromise = null
      throw err
    })
  }
  const client = await clientPromise
  return client.db(process.env.MONGODB_DB || 'misiones_espaciales')
}

// Convierte un id de la URL a ObjectId; si no es válido se trata como "no encontrado".
export function toObjectId(id, notFoundMessage = 'Recurso no encontrado') {
  if (typeof id !== 'string' || !ObjectId.isValid(id) || String(new ObjectId(id)) !== id) {
    throw new HttpError(404, notFoundMessage)
  }
  return new ObjectId(id)
}

// Igual que toObjectId, pero para referencias enviadas en el cuerpo (400 en vez de 404).
export function toRefId(id, field) {
  const value = String(id ?? '')
  if (!ObjectId.isValid(value) || String(new ObjectId(value)) !== value) {
    throw new HttpError(400, `${field} no existe`)
  }
  return new ObjectId(value)
}

// Expone _id como "id" (string) y las referencias ObjectId como string para el frontend.
export function serialize(doc) {
  if (!doc) return doc
  const { _id, ...rest } = doc
  const out = { id: String(_id) }
  for (const [key, value] of Object.entries(rest)) {
    out[key] = value instanceof ObjectId ? String(value) : value
  }
  return out
}
