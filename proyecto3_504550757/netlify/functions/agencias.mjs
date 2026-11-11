import { getRedis, repo, checkId, porNombre, porFecha } from '../lib/db.mjs'
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
  const redis = await getRedis()
  const agencias = repo(redis, 'agencias')
  const id = routeId(req, 'agencias')

  if (!id) {
    // GET /api/agencias (público)
    if (req.method === 'GET') {
      return json((await agencias.list()).sort(porNombre))
    }

    // POST /api/agencias (requiere usuario autenticado)
    if (req.method === 'POST') {
      requireRole(req, ROLES.ADMIN, ROLES.EDITOR)
      const body = await readBody(req)
      if (!body.nombre || !body.pais || !body.anio_fundacion) {
        throw new HttpError(400, 'nombre, pais y anio_fundacion son obligatorios')
      }
      const creada = await agencias.create({ sitio_web: null, imagen_url: null, ...normalizar(body) })
      return json(creada, 201)
    }

    throw methodNotAllowed()
  }

  checkId(id, NO_ENCONTRADA)

  // GET /api/agencias/:id (público) — incluye las misiones que la referencian
  if (req.method === 'GET') {
    const agencia = await agencias.get(id)
    if (!agencia) throw new HttpError(404, NO_ENCONTRADA)
    const misiones = (await repo(redis, 'misiones').list())
      .filter((m) => m.agencia_id === id)
      .sort(porFecha)
      .map(({ id, nombre, fecha_lanzamiento, estado }) => ({ id, nombre, fecha_lanzamiento, estado }))
    return json({ ...agencia, misiones })
  }

  // PUT /api/agencias/:id (requiere usuario autenticado)
  if (req.method === 'PUT') {
    requireRole(req, ROLES.ADMIN, ROLES.EDITOR)
    const body = await readBody(req)
    const actualizada = await agencias.update(id, normalizar(body))
    if (!actualizada) throw new HttpError(404, NO_ENCONTRADA)
    return json(actualizada)
  }

  // DELETE /api/agencias/:id (solo administradores)
  if (req.method === 'DELETE') {
    requireRole(req, ROLES.ADMIN)
    if (!(await agencias.exists(id))) throw new HttpError(404, NO_ENCONTRADA)
    const enUso = (await repo(redis, 'misiones').list()).some((m) => m.agencia_id === id)
    if (enUso) {
      throw new HttpError(409, 'No se puede borrar: hay misiones que referencian esta agencia')
    }
    await agencias.remove(id)
    return json({ ok: true })
  }

  throw methodNotAllowed()
})
