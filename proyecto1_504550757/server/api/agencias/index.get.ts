export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const { results } = await db.prepare('SELECT * FROM agencias ORDER BY nombre').all()
  return results
})
