export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const { results } = await db
    .prepare(
      `SELECT m.*, a.nombre AS agencia_nombre, c.nombre AS cohete_nombre
       FROM misiones m
       LEFT JOIN agencias a ON a.id = m.agencia_id
       LEFT JOIN cohetes c ON c.id = m.cohete_id
       ORDER BY m.fecha_lanzamiento`
    )
    .all()
  return results
})
