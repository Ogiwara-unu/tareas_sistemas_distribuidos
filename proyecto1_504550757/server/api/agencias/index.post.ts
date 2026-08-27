export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const body = await readBody(event)
  const { nombre, pais, anio_fundacion, sitio_web, imagen_url } = body ?? {}

  if (!nombre || !pais || !anio_fundacion) {
    throw createError({ statusCode: 400, statusMessage: 'nombre, pais y anio_fundacion son obligatorios' })
  }

  const result = await db
    .prepare('INSERT INTO agencias (nombre, pais, anio_fundacion, sitio_web, imagen_url) VALUES (?, ?, ?, ?, ?)')
    .bind(nombre, pais, anio_fundacion, sitio_web ?? null, imagen_url ?? null)
    .run()

  const id = result.meta.last_row_id
  const created = await db.prepare('SELECT * FROM agencias WHERE id = ?').bind(id).first()
  setResponseStatus(event, 201)
  return created
})
