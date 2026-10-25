import { getDb, toObjectId, toRefId, serialize } from '../lib/db.mjs'
import { handler, json, readBody, routeId, HttpError, methodNotAllowed } from '../lib/http.mjs'
import { requireRole, ROLES } from '../lib/auth.mjs'

const NO_ENCONTRADA = 'Misión no encontrada'
const CAMPOS = ['nombre', 'fecha_lanzamiento', 'destino', 'estado', 'descripcion', 'imagen_url']

// Equivalente al LEFT JOIN del Proyecto 1: agrega agencia_nombre y cohete_nombre.
const CON_NOMBRES = [
  { $lookup: { from: 'agencias', localField: 'agencia_id', foreignField: '_id', as: 'agencia' } },
  { $lookup: { from: 'cohetes', localField: 'cohete_id', foreignField: '_id', as: 'cohete' } },
  {
    $set: {
      agencia_nombre: { $first: '$agencia.nombre' },
      cohete_nombre: { $first: '$cohete.nombre' }
    }
  },
  { $project: { agencia: 0, cohete: 0 } }
]

// Valida que las referencias existan y las convierte a ObjectId.
async function resolverReferencias(db, body, out) {
  if (body.agencia_id) {
    out.agencia_id = toRefId(body.agencia_id, 'agencia_id')
    const agencia = await db.collection('agencias').findOne({ _id: out.agencia_id }, { projection: { _id: 1 } })
    if (!agencia) throw new HttpError(400, 'agencia_id no existe')
  }
  if (body.cohete_id) {
    out.cohete_id = toRefId(body.cohete_id, 'cohete_id')
    const cohete = await db.collection('cohetes').findOne({ _id: out.cohete_id }, { projection: { _id: 1 } })
    if (!cohete) throw new HttpError(400, 'cohete_id no existe')
  }
  return out
}

function campos(body) {
  const out = {}
  for (const key of CAMPOS) {
    if (body[key] !== undefined) out[key] = body[key]
  }
  return out
}

export default handler(async (req) => {
  const db = await getDb()
  const misiones = db.collection('misiones')
  const id = routeId(req, 'misiones')

  if (!id) {
    // GET /api/misiones (público)
    if (req.method === 'GET') {
      const results = await misiones.aggregate([{ $sort: { fecha_lanzamiento: 1 } }, ...CON_NOMBRES]).toArray()
      return json(results.map(serialize))
    }

    // POST /api/misiones (requiere usuario autenticado)
    if (req.method === 'POST') {
      requireRole(req, ROLES.ADMIN, ROLES.EDITOR)
      const body = await readBody(req)
      const { nombre, fecha_lanzamiento, destino, estado, agencia_id, cohete_id } = body
      if (!nombre || !fecha_lanzamiento || !destino || !estado || !agencia_id || !cohete_id) {
        throw new HttpError(400, 'nombre, fecha_lanzamiento, destino, estado, agencia_id y cohete_id son obligatorios')
      }
      const doc = await resolverReferencias(db, body, { descripcion: null, imagen_url: null, ...campos(body) })
      const { insertedId } = await misiones.insertOne(doc)
      return json(serialize(await misiones.findOne({ _id: insertedId })), 201)
    }

    throw methodNotAllowed()
  }

  const _id = toObjectId(id, NO_ENCONTRADA)

  // GET /api/misiones/:id (público)
  if (req.method === 'GET') {
    const [mision] = await misiones.aggregate([{ $match: { _id } }, ...CON_NOMBRES]).toArray()
    if (!mision) throw new HttpError(404, NO_ENCONTRADA)
    return json(serialize(mision))
  }

  // PUT /api/misiones/:id (requiere usuario autenticado)
  if (req.method === 'PUT') {
    requireRole(req, ROLES.ADMIN, ROLES.EDITOR)
    const existing = await misiones.findOne({ _id }, { projection: { _id: 1 } })
    if (!existing) throw new HttpError(404, NO_ENCONTRADA)
    const body = await readBody(req)
    const cambios = await resolverReferencias(db, body, campos(body))
    const updated = await misiones.findOneAndUpdate({ _id }, { $set: cambios }, { returnDocument: 'after' })
    return json(serialize(updated))
  }

  // DELETE /api/misiones/:id (solo administradores)
  if (req.method === 'DELETE') {
    requireRole(req, ROLES.ADMIN)
    const { deletedCount } = await misiones.deleteOne({ _id })
    if (!deletedCount) throw new HttpError(404, NO_ENCONTRADA)
    return json({ ok: true })
  }

  throw methodNotAllowed()
})
