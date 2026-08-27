export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const id = getRouterParam(event, 'id')

  const agencia = await db.prepare('SELECT * FROM agencias WHERE id = ?').bind(id).first()
  if (!agencia) {
    throw createError({ statusCode: 404, statusMessage: 'Agencia no encontrada' })
  }

  const { results: misiones } = await db
    .prepare('SELECT id, nombre, fecha_lanzamiento, estado FROM misiones WHERE agencia_id = ? ORDER BY fecha_lanzamiento')
    .bind(id)
    .all()

  return { ...agencia, misiones }
})
