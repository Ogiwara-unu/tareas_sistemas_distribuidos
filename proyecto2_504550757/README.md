# Catálogo de misiones espaciales — Proyecto 2

**Estudiante:** Randall Alvarez Chevez
**Enlace publicado:** https://misiones-espaciales-504550757.netlify.app

Proyecto 2 de Sistemas Distribuidos. Es la continuación del Proyecto 1 (tema #22: misiones espaciales).
Se mantienen las mismas tres entidades, el mismo frontend en Vue (Nuxt) y las mismas rutas REST, con estos cambios:

| | Proyecto 1 | Proyecto 2 |
|---|---|---|
| FaaS | Cloudflare Workers | **Netlify Functions** (`netlify/functions`) |
| Base de datos | D1 (SQLite) | **MongoDB Atlas** |
| Autenticación | — | **JWT** (registro, login, rutas protegidas) |
| Frontend | Nuxt SSR en el Worker | Nuxt/Vue como SPA estática en Netlify |

## Estructura

```
netlify.toml              # build, carpeta de funciones y redirecciones /api/* -> funciones
netlify/functions/
  misiones.mjs            # /api/misiones[/:id]
  agencias.mjs            # /api/agencias[/:id]
  cohetes.mjs             # /api/cohetes[/:id]
  auth.mjs                # /api/auth/registro, /api/auth/login, /api/auth/me
netlify/lib/
  db.mjs                  # conexión a Atlas reutilizada entre invocaciones
  auth.mjs                # firma y validación de JWT (401 / 403)
  http.mjs                # respuestas JSON y manejo de errores
scripts/seed.mjs          # migra los datos del Proyecto 1 a MongoDB y crea el admin
db/seed-data.json         # datos del Proyecto 1 exportados desde D1 (17 misiones, 7 agencias, 12 cohetes)
app/                      # frontend Vue (Nuxt)
  composables/useAuth.ts  # token y usuario en localStorage
  plugins/api.ts          # agrega "Authorization: Bearer" y redirige a /login ante un 401
  pages/login.vue, pages/registro.vue
```

## Modelo de datos (MongoDB)

Cada tabla del Proyecto 1 pasó a ser una colección y cada fila un documento. Los ids son `ObjectId`.
La API los expone como `id` (string).

- **`misiones`** (principal): nombre, fecha_lanzamiento, destino, estado, descripcion, imagen_url,
  `agencia_id` → `agencias._id`, `cohete_id` → `cohetes._id`.
- **`agencias`**: nombre, pais, anio_fundacion, sitio_web, imagen_url.
- **`cohetes`**: nombre, fabricante, altura_m, masa_despegue_kg, imagen_url.
- **`usuarios`**: nombre, correo (índice único), password_hash (bcrypt), rol (`admin` | `editor`), creado_en.

Las relaciones se resuelven con `$lookup` (el nombre de la agencia y del cohete en cada misión) y con
consultas por referencia (las misiones de una agencia o de un cohete), igual que los JOIN del Proyecto 1.

## API REST

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/misiones`, `/api/misiones/:id` | público |
| POST | `/api/misiones` | usuario autenticado (editor o admin) |
| PUT | `/api/misiones/:id` | usuario autenticado (editor o admin) |
| DELETE | `/api/misiones/:id` | solo **admin** |

Las rutas `/api/agencias` y `/api/cohetes` siguen el mismo patrón. El detalle de cada una incluye las misiones
relacionadas, y no se pueden borrar mientras alguna misión las referencie (409).

### Autenticación

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/registro` | `{ nombre, correo, password }` → crea un usuario con rol `editor` y devuelve `{ token, usuario }` |
| POST | `/api/auth/login` | `{ correo, password }` → `{ token, usuario }` |
| GET | `/api/auth/me` | devuelve el usuario del token (protegida) |

- Las contraseñas se guardan con **bcrypt**; nunca se guardan en texto plano.
- El JWT (HS256) contiene `sub` (id del usuario), `nombre`, `correo`, `rol`, `iat` y `exp`. Se firma con
  `JWT_SECRET` y dura `JWT_EXPIRES_IN` (2 h por defecto).
- Las peticiones protegidas envían `Authorization: Bearer <token>`. Cada función verifica la firma y la
  expiración antes de atender la petición:
  - **401** si no hay token, o si es inválido o expiró.
  - **403** si el rol no permite la operación (por ejemplo, un `editor` que intenta borrar).

### Frontend

- Pantallas `/login` y `/registro`. El token se guarda en `localStorage` y se adjunta automáticamente a cada
  petición.
- Los formularios de creación y el botón *Editar* solo se muestran a usuarios autenticados. *Borrar* solo se
  muestra al rol `admin`.
- *Salir* elimina el token. Si el servicio responde 401, por ejemplo porque el token expiró, se cierra la
  sesión y se redirige a `/login`. Después de iniciar sesión, la app vuelve a la página donde estaba el usuario.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `MONGODB_URI` | Cadena de conexión de MongoDB Atlas (`mongodb+srv://...`) |
| `MONGODB_DB` | Nombre de la base de datos (opcional, por defecto `misiones_espaciales`) |
| `JWT_SECRET` | Clave secreta para firmar los JWT (larga y aleatoria) |
| `JWT_EXPIRES_IN` | Duración del token (opcional, por defecto `2h`) |
| `ADMIN_CORREO`, `ADMIN_PASSWORD`, `ADMIN_NOMBRE` | Solo para `npm run db:seed`: crea el usuario administrador |

Estos valores **no** se incluyen en el código. Para desarrollo local se copia `.env.example` a `.env`
(el `.env` está en `.gitignore`). En producción se configuran en Netlify.

### 1. MongoDB Atlas

1. Crear un clúster (el plan gratuito M0 es suficiente).
2. **Database Access** → crear un usuario de base de datos con contraseña.
3. **Network Access** → *Add IP Address* → `0.0.0.0/0` (*Allow access from anywhere*). Netlify Functions no
   tiene IPs fijas, así que el clúster debe aceptar conexiones desde cualquier IP.
4. **Connect → Drivers** → copiar la cadena `mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/`.

### 2. Generar la clave JWT

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

### 3. Configurar las variables en Netlify

En el panel: **Site configuration → Environment variables → Add a variable**, agregar `MONGODB_URI`,
`JWT_SECRET` y, si se desea, `MONGODB_DB` y `JWT_EXPIRES_IN`. También se pueden configurar con la CLI:

```bash
npx netlify env:set MONGODB_URI "mongodb+srv://..."
npx netlify env:set JWT_SECRET "clave-generada"
```

Después de cambiar variables, hay que volver a desplegar el sitio.

## Desarrollo local

```bash
npm install
cp .env.example .env          # y completar MONGODB_URI, JWT_SECRET, ADMIN_CORREO, ADMIN_PASSWORD
npm run db:seed               # carga los datos del Proyecto 1 en Atlas y crea el usuario admin
npm run netlify:dev           # frontend + funciones en http://localhost:8888
```

`netlify dev` lee el `.env` y sirve el frontend y las funciones en el mismo puerto, igual que en producción.

## Despliegue en Netlify

```bash
npx netlify login
npx netlify init              # o "netlify link" si el sitio ya existe (también se puede conectar el repo en el panel)
# configurar las variables de entorno (ver arriba)
npm run deploy                # netlify deploy --build --prod
```

Netlify ejecuta `npm run generate` (SPA en `.output/public`) y empaqueta las funciones de
`netlify/functions` según `netlify.toml`.

## Entrega

El zip no incluye `node_modules`, `.nuxt`, `.output`, `.netlify` ni `.env`.
