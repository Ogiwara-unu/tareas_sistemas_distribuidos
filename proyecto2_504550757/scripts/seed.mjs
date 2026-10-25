// Migra los datos del Proyecto 1 (db/seed-data.json, exportado desde D1/SQLite) a MongoDB Atlas.
// Cada tabla pasa a ser una colección; los ids numéricos se reemplazan por ObjectId y las
// referencias agencia_id / cohete_id de cada misión se traducen a los nuevos ObjectId.
//
// Uso: npm run db:seed   (lee MONGODB_URI, MONGODB_DB, ADMIN_* desde .env o del entorno)
import { readFile } from 'node:fs/promises'
import { MongoClient, ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('Falta MONGODB_URI (defínela en .env o en el entorno).')
  process.exit(1)
}

const data = JSON.parse(await readFile(new URL('../db/seed-data.json', import.meta.url), 'utf8'))
const client = new MongoClient(uri)

try {
  await client.connect()
  const db = client.db(process.env.MONGODB_DB || 'misiones_espaciales')

  for (const name of ['misiones', 'agencias', 'cohetes']) {
    await db.collection(name).deleteMany({})
  }

  const mapa = { agencias: new Map(), cohetes: new Map() }
  for (const name of ['agencias', 'cohetes']) {
    const docs = data[name].map(({ id, ...rest }) => {
      const _id = new ObjectId()
      mapa[name].set(id, _id)
      return { _id, ...rest }
    })
    await db.collection(name).insertMany(docs)
    console.log(`${name}: ${docs.length} documentos`)
  }

  const misiones = data.misiones.map(({ id, agencia_id, cohete_id, ...rest }) => ({
    ...rest,
    agencia_id: mapa.agencias.get(agencia_id),
    cohete_id: mapa.cohetes.get(cohete_id)
  }))
  await db.collection('misiones').insertMany(misiones)
  console.log(`misiones: ${misiones.length} documentos`)

  await db.collection('misiones').createIndex({ agencia_id: 1 })
  await db.collection('misiones').createIndex({ cohete_id: 1 })
  await db.collection('usuarios').createIndex({ correo: 1 }, { unique: true })

  // Usuario administrador inicial (opcional). No se borra la colección de usuarios.
  const correo = process.env.ADMIN_CORREO?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (correo && password) {
    await db.collection('usuarios').updateOne(
      { correo },
      {
        $set: {
          nombre: process.env.ADMIN_NOMBRE || 'Administrador',
          password_hash: await bcrypt.hash(password, 10),
          rol: 'admin'
        },
        $setOnInsert: { correo, creado_en: new Date() }
      },
      { upsert: true }
    )
    console.log(`usuario admin: ${correo}`)
  } else {
    console.log('ADMIN_CORREO / ADMIN_PASSWORD no definidos: no se creó usuario admin.')
  }
} finally {
  await client.close()
}
