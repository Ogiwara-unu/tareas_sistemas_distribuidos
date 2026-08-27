export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const id = getRouterParam(event, 'id')

  const existing = await db.prepare('SELECT * FROM agencias WHERE id = ?').bind(id).first()
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Agencia no encontrada' })
  }

  const enUso = await db.prepare('SELECT COUNT(*) as n FROM misiones WHERE agencia_id = ?').bind(id).first()
  if ((enUso as any).n > 0) {
    throw createError({ statusCode: 409, statusMessage: 'No se puede borrar: hay misiones que referencian esta agencia' })
  }

  await db.prepare('DELETE FROM agencias WHERE id = ?').bind(id).run()
  return { ok: true }
})
