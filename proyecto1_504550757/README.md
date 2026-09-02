# Catálogo de misiones espaciales

**Estudiante:** Randall Alvarez
**Enlace publicado:** https://misiones-espaciales.proyecto1-504550757.workers.dev

Proyecto 1 de Sistemas Distribuidos: catálogo temático (tema #22 — misiones espaciales) construido con
[Nuxt 3](https://nuxt.com) desplegado como un único Cloudflare Worker (FaaS) que sirve tanto el frontend Vue
como la API REST (`server/api`), con [D1](https://developers.cloudflare.com/d1/) (SQLite) como base de datos.

## Modelo de datos

- **`misiones`** (entidad principal): nombre, fecha de lanzamiento, destino, estado, descripción, imagen,
  referencia a `agencias` y a `cohetes`.
- **`agencias`** (entidad secundaria): nombre, país, año de fundación, sitio web, imagen.
- **`cohetes`** (entidad secundaria): nombre, fabricante, altura, masa de despegue, imagen.

Cada misión enlaza a su agencia y su cohete; cada agencia/cohete muestra las misiones que la referencian
(navegación cruzada entre las tres entidades).

El esquema está en [`db/schema.sql`](./db/schema.sql) y los datos iniciales (17 misiones, 7 agencias,
12 cohetes) en [`db/seed.sql`](./db/seed.sql).

## API REST

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/misiones` | Listar misiones (incluye nombre de agencia y cohete) |
| GET | `/api/misiones/:id` | Ver una misión |
| POST | `/api/misiones` | Crear misión |
| PUT | `/api/misiones/:id` | Editar misión |
| DELETE | `/api/misiones/:id` | Borrar misión |

Mismo patrón para `/api/agencias` y `/api/cohetes` (estas dos incluyen, en el detalle, la lista de misiones
relacionadas y no se pueden borrar mientras alguna misión las referencie).

## Desarrollo local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar sesión en Cloudflare (una sola vez, abre el navegador):
   ```bash
   npx wrangler login
   ```
3. Crear la base de datos D1 y copiar el `database_id` que devuelve al `wrangler.toml`
   (reemplazar `REEMPLAZAR_CON_ID_REAL`):
   ```bash
   npx wrangler d1 create misiones-espaciales-db
   ```
4. Aplicar el esquema y los datos de ejemplo en la base de datos **local** (usada por `npm run dev`):
   ```bash
   npm run db:migrate:local
   npm run db:seed:local
   ```
5. Levantar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Abrir `http://localhost:3000`.

## Despliegue a Cloudflare

1. Aplicar el esquema y los datos de ejemplo en la base de datos **remota** (D1 real en Cloudflare):
   ```bash
   npm run db:migrate:remote
   npm run db:seed:remote
   ```
2. Compilar y desplegar el Worker:
   ```bash
   npm run deploy
   ```
3. Copiar la URL que imprime `wrangler deploy` (`https://misiones-espaciales.<subdominio>.workers.dev`)
   y pegarla arriba, en **Enlace publicado**.

## Entrega

Generar el zip del proyecto **sin** `node_modules` (por ejemplo, comprimiendo la carpeta luego de excluir
`node_modules`, `.nuxt`, `.output` y `.wrangler`, que ya están listados en `.gitignore`).
