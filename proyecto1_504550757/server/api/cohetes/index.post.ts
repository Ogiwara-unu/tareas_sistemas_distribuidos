export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const body = await readBody(event)
  const { nombre, fabricante, altura_m, masa_despegue_kg, imagen_url } = body ?? {}

  if (!nombre || !fabricante || !altura_m || !masa_despegue_kg) {
    throw createError({ statusCode: 400, statusMessage: 'nombre, fabricante, altura_m y masa_despegue_kg son obligatorios' })
  }

  const result = await db
    .prepare('INSERT INTO cohetes (nombre, fabricante, altura_m, masa_despegue_kg, imagen_url) VALUES (?, ?, ?, ?, ?)')
    .bind(nombre, fabricante, altura_m, masa_despegue_kg, imagen_url ?? null)
    .run()

  const id = result.meta.last_row_id
  const created = await db.prepare('SELECT * FROM cohetes WHERE id = ?').bind(id).first()
  setResponseStatus(event, 201)
  return created
})
