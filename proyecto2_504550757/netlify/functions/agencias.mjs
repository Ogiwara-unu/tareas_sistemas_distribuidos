import { getDb, toObjectId, serialize } from '../lib/db.mjs'
import { handler, json, readBody, routeId, HttpError, methodNotAllowed } from '../lib/http.mjs'
import { requireRole, ROLES } from '../lib/auth.mjs'

const NO_ENCONTRADA = 'Agencia no encontrada'
const CAMPOS = ['nombre', 'pais', 'anio_fundacion', 'sitio_web', 'imagen_url']

function normalizar(data) {
  const out = {}
  for (const key of CAMPOS) {
    if (data[key] === undefined) continue
    out[key] = key === 'anio_fundacion' && data[key] !== null ? Number(data[key]) : data[key]
  }
  return out
}

export default handler(async (req) => {
  const db = await getDb()
  const agencias = db.collection('agencias')
  const id = routeId(req, 'agencias')

  if (!id) {
    // GET /api/agencias (público)
    if (req.method === 'GET') {
      const results = await agencias.find().sort({ nombre: 1 }).toArray()
      return json(results.map(serialize))
    }

    // POST /api/agencias (requiere usuario autenticado)
    if (req.method === 'POST') {
      requireRole(req, ROLES.ADMIN, ROLES.EDITOR)
      const body = await readBody(req)
      if (!body.nombre || !body.pais || !body.anio_fundacion) {
        throw new HttpError(400, 'nombre, pais y anio_fundacion son obligatorios')
      }
      const doc = { sitio_web: null, imagen_url: null, ...normalizar(body) }
      const { insertedId } = await agencias.insertOne(doc)
      return json(serialize(await agencias.findOne({ _id: insertedId })), 201)
    }

    throw methodNotAllowed()
  }

  const _id = toObjectId(id, NO_ENCONTRADA)

  // GET /api/agencias/:id (público) — incluye las misiones que la referencian
  if (req.method === 'GET') {
    const agencia = await agencias.findOne({ _id })
    if (!agencia) throw new HttpError(404, NO_ENCONTRADA)
    const misiones = await db
      .collection('misiones')
      .find({ agencia_id: _id }, { projection: { nombre: 1, fecha_lanzamiento: 1, estado: 1 } })
      .sort({ fecha_lanzamiento: 1 })
      .toArray()
    return json({ ...serialize(agencia), misiones: misiones.map(serialize) })
  }

  // PUT /api/agencias/:id (requiere usuario autenticado)
  if (req.method === 'PUT') {
    requireRole(req, ROLES.ADMIN, ROLES.EDITOR)
    const body = await readBody(req)
    const updated = await agencias.findOneAndUpdate(
      { _id },
      { $set: normalizar(body) },
      { returnDocument: 'after' }
    )
    if (!updated) throw new HttpError(404, NO_ENCONTRADA)
    return json(serialize(updated))
  }

  // DELETE /api/agencias/:id (solo administradores)
  if (req.method === 'DELETE') {
    requireRole(req, ROLES.ADMIN)
    const existing = await agencias.findOne({ _id })
    if (!existing) throw new HttpError(404, NO_ENCONTRADA)
    const enUso = await db.collection('misiones').countDocuments({ agencia_id: _id })
    if (enUso > 0) {
      throw new HttpError(409, 'No se puede borrar: hay misiones que referencian esta agencia')
    }
    await agencias.deleteOne({ _id })
    return json({ ok: true })
  }

  throw methodNotAllowed()
})
