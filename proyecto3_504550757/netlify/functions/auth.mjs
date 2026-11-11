import bcrypt from 'bcryptjs'
import { getRedis, repo } from '../lib/db.mjs'
import { handler, json, readBody, routeId, HttpError, methodNotAllowed } from '../lib/http.mjs'
import { signToken, requireAuth, ROLES } from '../lib/auth.mjs'

const CORREO_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Hash auxiliar correo -> id del usuario: permite buscar por correo y garantiza que sea único.
const POR_CORREO = 'usuarios:correo'

// Datos públicos del usuario (nunca se devuelve el hash de la contraseña).
function publico(usuario) {
  return { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol }
}

function respuestaSesion(usuario, status = 200) {
  return json({ token: signToken(usuario), usuario: publico(usuario) }, status)
}

export default handler(async (req) => {
  const accion = routeId(req, 'auth')

  // POST /api/auth/registro — crea un usuario con rol "editor"
  if (accion === 'registro') {
    if (req.method !== 'POST') throw methodNotAllowed()
    const body = await readBody(req)
    const nombre = String(body.nombre ?? '').trim()
    const correo = String(body.correo ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')

    if (!nombre || !correo || !password) {
      throw new HttpError(400, 'nombre, correo y password son obligatorios')
    }
    if (!CORREO_RE.test(correo)) throw new HttpError(400, 'El correo no es válido')
    if (password.length < 8) throw new HttpError(400, 'La contraseña debe tener al menos 8 caracteres')

    const redis = await getRedis()
    if (await redis.hExists(POR_CORREO, correo)) {
      throw new HttpError(409, 'Ya existe un usuario con ese correo')
    }

    const password_hash = await bcrypt.hash(password, 10)
    const id = String(await redis.incr('seq:usuarios'))
    // HSETNX es atómico: si dos registros simultáneos usan el mismo correo, solo uno gana.
    if (!(await redis.hSetNX(POR_CORREO, correo, id))) {
      throw new HttpError(409, 'Ya existe un usuario con ese correo')
    }
    const usuario = { id, nombre, correo, password_hash, rol: ROLES.EDITOR, creado_en: new Date().toISOString() }
    await redis.hSet('usuarios', id, JSON.stringify(usuario))
    return respuestaSesion(usuario, 201)
  }

  // POST /api/auth/login — valida credenciales y devuelve un JWT firmado
  if (accion === 'login') {
    if (req.method !== 'POST') throw methodNotAllowed()
    const body = await readBody(req)
    const correo = String(body.correo ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    if (!correo || !password) throw new HttpError(400, 'correo y password son obligatorios')

    const redis = await getRedis()
    const id = await redis.hGet(POR_CORREO, correo)
    const usuario = id ? await repo(redis, 'usuarios').get(id) : null
    const valido = usuario && (await bcrypt.compare(password, usuario.password_hash))
    if (!valido) throw new HttpError(401, 'Correo o contraseña incorrectos')
    return respuestaSesion(usuario)
  }

  // GET /api/auth/me — devuelve el usuario del token (ruta protegida)
  if (accion === 'me') {
    if (req.method !== 'GET') throw methodNotAllowed()
    const payload = requireAuth(req)
    const usuario = await repo(await getRedis(), 'usuarios').get(String(payload.sub))
    if (!usuario) throw new HttpError(401, 'El usuario del token ya no existe')
    return json(publico(usuario))
  }

  throw new HttpError(404, 'Ruta no encontrada')
})
