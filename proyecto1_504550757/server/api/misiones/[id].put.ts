export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const existing = await db.prepare('SELECT * FROM misiones WHERE id = ?').bind(id).first()
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Misión no encontrada' })
  }

  const nombre = body?.nombre ?? existing.nombre
  const fecha_lanzamiento = body?.fecha_lanzamiento ?? existing.fecha_lanzamiento
  const destino = body?.destino ?? existing.destino
  const estado = body?.estado ?? existing.estado
  const descripcion = body?.descripcion ?? existing.descripcion
  const imagen_url = body?.imagen_url ?? existing.imagen_url
  const agencia_id = body?.agencia_id ?? existing.agencia_id
  const cohete_id = body?.cohete_id ?? existing.cohete_id

  if (body?.agencia_id) {
    const agencia = await db.prepare('SELECT id FROM agencias WHERE id = ?').bind(agencia_id).first()
    if (!agencia) throw createError({ statusCode: 400, statusMessage: 'agencia_id no existe' })
  }
  if (body?.cohete_id) {
    const cohete = await db.prepare('SELECT id FROM cohetes WHERE id = ?').bind(cohete_id).first()
    if (!cohete) throw createError({ statusCode: 400, statusMessage: 'cohete_id no existe' })
  }

  await db
    .prepare(
      `UPDATE misiones
       SET nombre = ?, fecha_lanzamiento = ?, destino = ?, estado = ?, descripcion = ?, imagen_url = ?, agencia_id = ?, cohete_id = ?
       WHERE id = ?`
    )
    .bind(nombre, fecha_lanzamiento, destino, estado, descripcion, imagen_url, agencia_id, cohete_id, id)
    .run()

  return await db.prepare('SELECT * FROM misiones WHERE id = ?').bind(id).first()
})
