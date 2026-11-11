import { getRedis, repo, checkId, checkRefId, porFecha } from '../lib/db.mjs'
import { handler, json, readBody, routeId, HttpError, methodNotAllowed } from '../lib/http.mjs'
import { requireRole, ROLES } from '../lib/auth.mjs'

const NO_ENCONTRADA = 'Misión no encontrada'
const CAMPOS = ['nombre', 'fecha_lanzamiento', 'destino', 'estado', 'descripcion', 'imagen_url']

// Equivalente al LEFT JOIN del Proyecto 1: agrega agencia_nombre y cohete_nombre
// buscando cada referencia en los hashes "agencias" y "cohetes".
async function conNombres(redis, misiones) {
  const agencias = new Map((await repo(redis, 'agencias').list()).map((a) => [a.id, a.nombre]))
  const cohetes = new Map((await repo(redis, 'cohetes').list()).map((c) => [c.id, c.nombre]))
  return misiones.map((m) => ({
    ...m,
    agencia_nombre: agencias.get(m.agencia_id) ?? null,
    cohete_nombre: cohetes.get(m.cohete_id) ?? null
  }))
}

// Valida que las referencias existan.
async function resolverReferencias(redis, body, out) {
  if (body.agencia_id) {
    out.agencia_id = checkRefId(body.agencia_id, 'agencia_id')
    if (!(await repo(redis, 'agencias').exists(out.agencia_id))) throw new HttpError(400, 'agencia_id no existe')
  }
  if (body.cohete_id) {
    out.cohete_id = checkRefId(body.cohete_id, 'cohete_id')
    if (!(await repo(redis, 'cohetes').exists(out.cohete_id))) throw new HttpError(400, 'cohete_id no existe')
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
  const redis = await getRedis()
  const misiones = repo(redis, 'misiones')
  const id = routeId(req, 'misiones')

  if (!id) {
    // GET /api/misiones (público)
    if (req.method === 'GET') {
      return json(await conNombres(redis, (await misiones.list()).sort(porFecha)))
    }

    // POST /api/misiones (requiere usuario autenticado)
    if (req.method === 'POST') {
      requireRole(req, ROLES.ADMIN, ROLES.EDITOR)
      const body = await readBody(req)
      const { nombre, fecha_lanzamiento, destino, estado, agencia_id, cohete_id } = body
      if (!nombre || !fecha_lanzamiento || !destino || !estado || !agencia_id || !cohete_id) {
        throw new HttpError(400, 'nombre, fecha_lanzamiento, destino, estado, agencia_id y cohete_id son obligatorios')
      }
      const data = await resolverReferencias(redis, body, { descripcion: null, imagen_url: null, ...campos(body) })
      return json(await misiones.create(data), 201)
    }

    throw methodNotAllowed()
  }

  checkId(id, NO_ENCONTRADA)

  // GET /api/misiones/:id (público)
  if (req.method === 'GET') {
    const mision = await misiones.get(id)
    if (!mision) throw new HttpError(404, NO_ENCONTRADA)
    const [conRefs] = await conNombres(redis, [mision])
    return json(conRefs)
  }

  // PUT /api/misiones/:id (requiere usuario autenticado)
  if (req.method === 'PUT') {
    requireRole(req, ROLES.ADMIN, ROLES.EDITOR)
    if (!(await misiones.exists(id))) throw new HttpError(404, NO_ENCONTRADA)
    const body = await readBody(req)
    const cambios = await resolverReferencias(redis, body, campos(body))
    const actualizada = await misiones.update(id, cambios)
    if (!actualizada) throw new HttpError(404, NO_ENCONTRADA)
    return json(actualizada)
  }

  // DELETE /api/misiones/:id (solo administradores)
  if (req.method === 'DELETE') {
    requireRole(req, ROLES.ADMIN)
    if (!(await misiones.remove(id))) throw new HttpError(404, NO_ENCONTRADA)
    return json({ ok: true })
  }

  throw methodNotAllowed()
})
