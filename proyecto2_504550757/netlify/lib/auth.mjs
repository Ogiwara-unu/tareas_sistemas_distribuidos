import jwt from 'jsonwebtoken'
import { HttpError } from './http.mjs'

export const ROLES = { ADMIN: 'admin', EDITOR: 'editor' }

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new HttpError(500, 'Falta la variable de entorno JWT_SECRET')
  }
  return secret
}

export function signToken(usuario) {
  return jwt.sign(
    { sub: String(usuario._id), nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
    getSecret(),
    { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  )
}

// Valida el encabezado "Authorization: Bearer <token>" (firma y expiración).
// Devuelve el payload del token o lanza 401.
export function requireAuth(req) {
  const header = req.headers.get('authorization') || ''
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) {
    throw new HttpError(401, 'Se requiere iniciar sesión')
  }
  try {
    return jwt.verify(token, getSecret(), { algorithms: ['HS256'] })
  } catch (err) {
    const msg = err instanceof jwt.TokenExpiredError ? 'La sesión expiró, inicia sesión de nuevo' : 'Token inválido'
    throw new HttpError(401, msg)
  }
}

// Igual que requireAuth, pero además exige uno de los roles indicados (403 si no lo tiene).
export function requireRole(req, ...roles) {
  const user = requireAuth(req)
  if (!roles.includes(user.rol)) {
    throw new HttpError(403, 'No tienes permiso para realizar esta operación')
  }
  return user
}
