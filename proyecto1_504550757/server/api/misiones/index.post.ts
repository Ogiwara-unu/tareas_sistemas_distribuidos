export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const body = await readBody(event)
  const { nombre, fecha_lanzamiento, destino, estado, descripcion, imagen_url, agencia_id, cohete_id } = body ?? {}

  if (!nombre || !fecha_lanzamiento || !destino || !estado || !agencia_id || !cohete_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'nombre, fecha_lanzamiento, destino, estado, agencia_id y cohete_id son obligatorios'
    })
  }

  const agencia = await db.prepare('SELECT id FROM agencias WHERE id = ?').bind(agencia_id).first()
  if (!agencia) throw createError({ statusCode: 400, statusMessage: 'agencia_id no existe' })

  const cohete = await db.prepare('SELECT id FROM cohetes WHERE id = ?').bind(cohete_id).first()
  if (!cohete) throw createError({ statusCode: 400, statusMessage: 'cohete_id no existe' })

  const result = await db
    .prepare(
      `INSERT INTO misiones (nombre, fecha_lanzamiento, destino, estado, descripcion, imagen_url, agencia_id, cohete_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(nombre, fecha_lanzamiento, destino, estado, descripcion ?? null, imagen_url ?? null, agencia_id, cohete_id)
    .run()

  const id = result.meta.last_row_id
  const created = await db.prepare('SELECT * FROM misiones WHERE id = ?').bind(id).first()
  setResponseStatus(event, 201)
  return created
})
