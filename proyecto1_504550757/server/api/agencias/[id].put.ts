export default defineEventHandler(async (event) => {
  const db = getDB(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const existing = await db.prepare('SELECT * FROM agencias WHERE id = ?').bind(id).first()
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Agencia no encontrada' })
  }

  const nombre = body?.nombre ?? existing.nombre
  const pais = body?.pais ?? existing.pais
  const anio_fundacion = body?.anio_fundacion ?? existing.anio_fundacion
  const sitio_web = body?.sitio_web ?? existing.sitio_web
  const imagen_url = body?.imagen_url ?? existing.imagen_url

  await db
    .prepare('UPDATE agencias SET nombre = ?, pais = ?, anio_fundacion = ?, sitio_web = ?, imagen_url = ? WHERE id = ?')
    .bind(nombre, pais, anio_fundacion, sitio_web, imagen_url, id)
    .run()

  return await db.prepare('SELECT * FROM agencias WHERE id = ?').bind(id).first()
})
