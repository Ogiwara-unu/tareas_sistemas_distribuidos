import { getRedis, repo, checkId, porNombre, porFecha } from '../lib/db.mjs'
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
  const redis = await getRedis()
  const cohetes = repo(redis, 'cohetes')
  const id = routeId(req, 'cohetes')

  if (!id) {
    // GET /api/cohetes (público)
    if (req.method === 'GET') {
      return json((await cohetes.list()).sort(porNombre))
    }

    // POST /api/cohetes (requiere usuario autenticado)
    if (req.method === 'POST') {
      requireRole(req, ROLES.ADMIN, ROLES.EDITOR)
      const body = await readBody(req)
      if (!body.nombre || !body.fabricante || !body.altura_m || !body.masa_despegue_kg) {
        throw new HttpError(400, 'nombre, fabricante, altura_m y masa_despegue_kg son obligatorios')
      }
      const creado = await cohetes.create({ imagen_url: null, ...normalizar(body) })
      return json(creado, 201)
    }

    throw methodNotAllowed()
  }

  checkId(id, NO_ENCONTRADO)

  // GET /api/cohetes/:id (público) — incluye las misiones que lo usan
  if (req.method === 'GET') {
    const cohete = await cohetes.get(id)
    if (!cohete) throw new HttpError(404, NO_ENCONTRADO)
    const misiones = (await repo(redis, 'misiones').list())
      .filter((m) => m.cohete_id === id)
      .sort(porFecha)
      .map(({ id, nombre, fecha_lanzamiento, estado }) => ({ id, nombre, fecha_lanzamiento, estado }))
    return json({ ...cohete, misiones })
  }

  // PUT /api/cohetes/:id (requiere usuario autenticado)
  if (req.method === 'PUT') {
    requireRole(req, ROLES.ADMIN, ROLES.EDITOR)
    const body = await readBody(req)
    const actualizado = await cohetes.update(id, normalizar(body))
    if (!actualizado) throw new HttpError(404, NO_ENCONTRADO)
    return json(actualizado)
  }

  // DELETE /api/cohetes/:id (solo administradores)
  if (req.method === 'DELETE') {
    requireRole(req, ROLES.ADMIN)
    if (!(await cohetes.exists(id))) throw new HttpError(404, NO_ENCONTRADO)
    const enUso = (await repo(redis, 'misiones').list()).some((m) => m.cohete_id === id)
    if (enUso) {
      throw new HttpError(409, 'No se puede borrar: hay misiones que referencian este cohete')
    }
    await cohetes.remove(id)
    return json({ ok: true })
  }

  throw methodNotAllowed()
})
