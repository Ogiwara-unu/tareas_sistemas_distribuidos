import { getDb, toObjectId, serialize } from '../lib/db.mjs'
import { handler, json, readBody, routeId, HttpError, methodNotAllowed } from '../lib/http.mjs'
import { requireRole, ROLES } from '../lib/auth.mjs'

const NO_ENCONTRADO = 'Cohete no encontrado'
const CAMPOS = ['nombre', 'fabricante', 'altura_m', 'masa_despegue_kg', 'imagen_url']
const NUMERICOS = ['altura_m', 'masa_despegue_kg']

function normalizar(data) {
  const out = {}
  for (const key of CAMPOS) {
    if (data[key] === undefined) continue
    out[key] = NUMERICOS.includes(key) && data[key] !== null ? Number(data[key]) : data[key]
  }
  return out
}

export default handler(async (req) => {
  const db = await getDb()
  const cohetes = db.collection('cohetes')
  const id = routeId(req, 'cohetes')

  if (!id) {
    // GET /api/cohetes (público)
    if (req.method === 'GET') {
      const results = await cohetes.find().sort({ nombre: 1 }).toArray()
      return json(results.map(serialize))
    }

    // POST /api/cohetes (requiere usuario autenticado)
    if (req.method === 'POST') {
      requireRole(req, ROLES.ADMIN, ROLES.EDITOR)
      const body = await readBody(req)
      if (!body.nombre || !body.fabricante || !body.altura_m || !body.masa_despegue_kg) {
        throw new HttpError(400, 'nombre, fabricante, altura_m y masa_despegue_kg son obligatorios')
      }
      const doc = { imagen_url: null, ...normalizar(body) }
      const { insertedId } = await cohetes.insertOne(doc)
      return json(serialize(await cohetes.findOne({ _id: insertedId })), 201)
    }

    throw methodNotAllowed()
  }

  const _id = toObjectId(id, NO_ENCONTRADO)

  // GET /api/cohetes/:id (público) — incluye las misiones que lo usan
  if (req.method === 'GET') {
    const cohete = await cohetes.findOne({ _id })
    if (!cohete) throw new HttpError(404, NO_ENCONTRADO)
    const misiones = await db
      .collection('misiones')
      .find({ cohete_id: _id }, { projection: { nombre: 1, fecha_lanzamiento: 1, estado: 1 } })
      .sort({ fecha_lanzamiento: 1 })
      .toArray()
    return json({ ...serialize(cohete), misiones: misiones.map(serialize) })
  }

  // PUT /api/cohetes/:id (requiere usuario autenticado)
  if (req.method === 'PUT') {
    requireRole(req, ROLES.ADMIN, ROLES.EDITOR)
    const body = await readBody(req)
    const updated = await cohetes.findOneAndUpdate(
      { _id },
      { $set: normalizar(body) },
      { returnDocument: 'after' }
    )
    if (!updated) throw new HttpError(404, NO_ENCONTRADO)
    return json(serialize(updated))
  }

  // DELETE /api/cohetes/:id (solo administradores)
  if (req.method === 'DELETE') {
    requireRole(req, ROLES.ADMIN)
    const existing = await cohetes.findOne({ _id })
    if (!existing) throw new HttpError(404, NO_ENCONTRADO)
    const enUso = await db.collection('misiones').countDocuments({ cohete_id: _id })
    if (enUso > 0) {
      throw new HttpError(409, 'No se puede borrar: hay misiones que referencian este cohete')
    }
    await cohetes.deleteOne({ _id })
    return json({ ok: true })
  }

  throw methodNotAllowed()
})
