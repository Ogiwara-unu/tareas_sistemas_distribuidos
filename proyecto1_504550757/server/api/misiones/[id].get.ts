export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const id = getRouterParam(event, 'id')

  const mision = await db
    .prepare(
      `SELECT m.*, a.nombre AS agencia_nombre, c.nombre AS cohete_nombre
       FROM misiones m
       LEFT JOIN agencias a ON a.id = m.agencia_id
       LEFT JOIN cohetes c ON c.id = m.cohete_id
       WHERE m.id = ?`
    )
    .bind(id)
    .first()

  if (!mision) {
    throw createError({ statusCode: 404, statusMessage: 'Misión no encontrada' })
  }

  return mision
})
