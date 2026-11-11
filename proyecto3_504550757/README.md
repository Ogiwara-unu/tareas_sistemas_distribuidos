# Catálogo de misiones espaciales — Proyecto 3

**Estudiante:** Randall Alvarez Chevez
**Enlace publicado:** https://misiones-espaciales-p3-504550757.netlify.app

Proyecto 3 de Sistemas Distribuidos. Es otra adaptación del Proyecto 1 (tema #22: misiones espaciales).
Se mantienen las mismas tres entidades, el mismo frontend en Vue (Nuxt) y las mismas rutas REST, con estos cambios:

| | Proyecto 1 | Proyecto 3 |
|---|---|---|
| FaaS | Cloudflare Workers | **Netlify Functions** (`netlify/functions`) |
| Base de datos | D1 (SQLite) | **Redis Cloud** |
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
  db.mjs                  # conexión a Redis Cloud reutilizada entre invocaciones + CRUD sobre hashes
  auth.mjs                # firma y validación de JWT (401 / 403)
  http.mjs                # respuestas JSON y manejo de errores
scripts/seed.mjs          # migra los datos del Proyecto 1 a Redis y crea el admin
db/seed-data.json         # datos del Proyecto 1 exportados desde D1 (17 misiones, 7 agencias, 12 cohetes)
app/                      # frontend Vue (Nuxt)
  composables/useAuth.ts  # token y usuario en localStorage
  plugins/api.ts          # agrega "Authorization: Bearer" y redirige a /login ante un 401
  pages/login.vue, pages/registro.vue
```

## Modelo de datos (Redis)

Cada tabla del Proyecto 1 pasó a ser un elemento de Redis (un **hash**) y cada fila un valor de ese hash:
el campo es el id y el valor es el registro serializado en JSON. Se conservan los ids del Proyecto 1
(identificadores propios); los nuevos se generan con `INCR seq:<entidad>`.

| Clave | Tipo | Contenido |
|---|---|---|
| `misiones` (principal) | hash | id → `{ id, nombre, fecha_lanzamiento, destino, estado, descripcion, imagen_url, agencia_id, cohete_id }` |
| `agencias` | hash | id → `{ id, nombre, pais, anio_fundacion, sitio_web, imagen_url }` |
| `cohetes` | hash | id → `{ id, nombre, fabricante, altura_m, masa_despegue_kg, imagen_url }` |
| `usuarios` | hash | id → `{ id, nombre, correo, password_hash (bcrypt), rol, creado_en }` |
| `usuarios:correo` | hash | correo → id del usuario (búsqueda en el login; `HSETNX` garantiza que el correo sea único) |
| `seq:misiones`, `seq:agencias`, `seq:cohetes`, `seq:usuarios` | string | contador para el siguiente id |

Las relaciones se mantienen por referencia: `agencia_id` y `cohete_id` de cada misión son ids de los hashes
`agencias` y `cohetes`. La API resuelve esas referencias para agregar `agencia_nombre` y `cohete_nombre`
(equivalente al JOIN del Proyecto 1) y para listar las misiones de una agencia o de un cohete en su detalle.

La conexión a Redis se guarda a nivel de módulo en `netlify/lib/db.mjs`, así que se reutiliza entre
invocaciones de la misma instancia de la función.

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
| `REDIS_URL` | Cadena de conexión de Redis Cloud (`redis://default:<contraseña>@<host>:<puerto>`) |
| `JWT_SECRET` | Clave secreta para firmar los JWT (larga y aleatoria) |
| `JWT_EXPIRES_IN` | Duración del token (opcional, por defecto `2h`) |
| `ADMIN_CORREO`, `ADMIN_PASSWORD`, `ADMIN_NOMBRE` | Solo para `npm run db:seed`: crea el usuario administrador |

Estos valores **no** se incluyen en el código. Para desarrollo local se copia `.env.example` a `.env`
(el `.env` está en `.gitignore`). En producción se configuran en Netlify.

### 1. Redis Cloud

1. Crear una cuenta en https://redis.io/cloud y una base de datos (el plan gratuito de 30 MB es suficiente).
2. En la base de datos → **Connect** → copiar el *public endpoint* (`host:puerto`) y la contraseña del usuario
   `default` (sección *Security*).
3. Armar la cadena: `redis://default:<contraseña>@<host>:<puerto>`. Si se activa TLS en la base, usar `rediss://`.
4. Acceso desde Netlify: Netlify Functions no tiene IPs fijas, así que la base **no** debe restringir las IPs
   de origen (la *CIDR allow list* debe estar desactivada, que es el valor por defecto). El acceso queda
   protegido por la contraseña.

### 2. Generar la clave JWT

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

### 3. Configurar las variables en Netlify

En el panel: **Site configuration → Environment variables → Add a variable**, agregar `REDIS_URL` y
`JWT_SECRET` (y, si se desea, `JWT_EXPIRES_IN`). También se pueden configurar con la CLI:

```bash
npx netlify env:set REDIS_URL "redis://default:<contraseña>@<host>:<puerto>"
npx netlify env:set JWT_SECRET "clave-generada"
```

Después de cambiar variables, hay que volver a desplegar el sitio.

## Desarrollo local

```bash
npm install
cp .env.example .env          # y completar REDIS_URL, JWT_SECRET, ADMIN_CORREO, ADMIN_PASSWORD
npm run db:seed               # carga los datos del Proyecto 1 en Redis y crea el usuario admin
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
