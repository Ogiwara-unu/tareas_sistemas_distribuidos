// Migra los datos del Proyecto 1 (db/seed-data.json, exportado desde D1/SQLite) a Redis Cloud.
// Cada tabla pasa a ser un HASH de Redis y cada fila un valor (campo = id, valor = JSON).
// Se conservan los ids del Proyecto 1, así que las referencias agencia_id / cohete_id
// de cada misión siguen apuntando a la agencia y al cohete correctos.
//
// Uso: npm run db:seed   (lee REDIS_URL y ADMIN_* desde .env o del entorno)
import { readFile } from 'node:fs/promises'
import { createClient } from 'redis'
import bcrypt from 'bcryptjs'

const url = process.env.REDIS_URL
if (!url) {
  console.error('Falta REDIS_URL (defínela en .env o en el entorno).')
  process.exit(1)
}

const data = JSON.parse(await readFile(new URL('../db/seed-data.json', import.meta.url), 'utf8'))
const redis = createClient({ url })
redis.on('error', (err) => console.error('Redis:', err.message))
await redis.connect()

const REFS = ['agencia_id', 'cohete_id']

try {
  for (const entidad of ['agencias', 'cohetes', 'misiones']) {
    const tx = redis.multi().del(entidad)
    let maxId = 0
    for (const fila of data[entidad]) {
      const registro = { ...fila, id: String(fila.id) }
      for (const ref of REFS) {
        if (registro[ref] != null) registro[ref] = String(registro[ref])
      }
      tx.hSet(entidad, registro.id, JSON.stringify(registro))
      maxId = Math.max(maxId, Number(fila.id))
    }
    // El contador continúa después del id más alto para que los nuevos registros no choquen.
    tx.set(`seq:${entidad}`, String(maxId))
    await tx.exec()
    console.log(`${entidad}: ${data[entidad].length} registros`)
  }

  // Usuario administrador inicial (opcional). No se borran los usuarios existentes.
  const correo = process.env.ADMIN_CORREO?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (correo && password) {
    let id = await redis.hGet('usuarios:correo', correo)
    const existente = id ? JSON.parse((await redis.hGet('usuarios', id)) ?? 'null') : null
    if (!id) {
      id = String(await redis.incr('seq:usuarios'))
      await redis.hSet('usuarios:correo', correo, id)
    }
    const usuario = {
      creado_en: new Date().toISOString(),
      ...existente,
      id,
      nombre: process.env.ADMIN_NOMBRE || 'Administrador',
      correo,
      password_hash: await bcrypt.hash(password, 10),
      rol: 'admin'
    }
    await redis.hSet('usuarios', id, JSON.stringify(usuario))
    console.log(`usuario admin: ${correo}`)
  } else {
    console.log('ADMIN_CORREO / ADMIN_PASSWORD no definidos: no se creó usuario admin.')
  }
} finally {
  await redis.close()
}
