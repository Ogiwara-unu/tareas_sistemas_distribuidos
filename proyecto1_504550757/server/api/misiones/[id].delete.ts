export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const id = getRouterParam(event, 'id')

  const existing = await db.prepare('SELECT * FROM misiones WHERE id = ?').bind(id).first()
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Misión no encontrada' })
  }

  await db.prepare('DELETE FROM misiones WHERE id = ?').bind(id).run()
  return { ok: true }
})
