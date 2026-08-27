export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const id = getRouterParam(event, 'id')

  const existing = await db.prepare('SELECT * FROM cohetes WHERE id = ?').bind(id).first()
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Cohete no encontrado' })
  }

  const enUso = await db.prepare('SELECT COUNT(*) as n FROM misiones WHERE cohete_id = ?').bind(id).first()
  if ((enUso as any).n > 0) {
    throw createError({ statusCode: 409, statusMessage: 'No se puede borrar: hay misiones que referencian este cohete' })
  }

  await db.prepare('DELETE FROM cohetes WHERE id = ?').bind(id).run()
  return { ok: true }
})
