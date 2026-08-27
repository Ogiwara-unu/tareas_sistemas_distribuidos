export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const existing = await db.prepare('SELECT * FROM cohetes WHERE id = ?').bind(id).first()
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Cohete no encontrado' })
  }

  const nombre = body?.nombre ?? existing.nombre
  const fabricante = body?.fabricante ?? existing.fabricante
  const altura_m = body?.altura_m ?? existing.altura_m
  const masa_despegue_kg = body?.masa_despegue_kg ?? existing.masa_despegue_kg
  const imagen_url = body?.imagen_url ?? existing.imagen_url

  await db
    .prepare('UPDATE cohetes SET nombre = ?, fabricante = ?, altura_m = ?, masa_despegue_kg = ?, imagen_url = ? WHERE id = ?')
    .bind(nombre, fabricante, altura_m, masa_despegue_kg, imagen_url, id)
    .run()

  return await db.prepare('SELECT * FROM cohetes WHERE id = ?').bind(id).first()
})
