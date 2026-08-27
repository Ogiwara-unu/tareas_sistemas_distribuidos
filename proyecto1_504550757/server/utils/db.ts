import type { H3Event } from 'h3'

export function getDB(event: H3Event): any {
  const db = (event.context as any)?.cloudflare?.env?.DB
  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: 'El binding D1 "DB" no está disponible. Revisa wrangler.toml y que el módulo nitro-cloudflare-dev esté activo en desarrollo.'
    })
  }
  return db
}
