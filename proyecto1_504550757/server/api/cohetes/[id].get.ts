export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const id = getRouterParam(event, 'id')

  const cohete = await db.prepare('SELECT * FROM cohetes WHERE id = ?').bind(id).first()
  if (!cohete) {
    throw createError({ statusCode: 404, statusMessage: 'Cohete no encontrado' })
  }

  const { results: misiones } = await db
    .prepare('SELECT id, nombre, fecha_lanzamiento, estado FROM misiones WHERE cohete_id = ? ORDER BY fecha_lanzamiento')
    .bind(id)
    .all()

  return { ...cohete, misiones }
})
