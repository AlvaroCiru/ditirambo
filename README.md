# Ditirambo

Plataforma privada (2 usuarios) de reseñas y recomendaciones mutuas de
películas, libros, música, ópera y arte.

## Stack

Next.js (App Router) + TypeScript + Tailwind + shadcn/ui, con Supabase
(Postgres + Auth + Storage) como backend y Vercel como hosting.

El login es con **nombre de usuario**, no con email real: internamente se
traduce a un email falso (`usuario@ditirambo.local`) que nunca necesita
existir ni recibir correo (ver `src/lib/username.ts`).

## Puesta en marcha (una sola vez)

1. **Crear el proyecto en Supabase**: entra en [supabase.com](https://supabase.com),
   crea una cuenta/proyecto nuevo (nombre sugerido: `ditirambo`).
2. **Aplicar el esquema**: en el panel del proyecto, abre el **SQL Editor** y
   ejecuta, en este orden, el contenido de cada archivo de
   [`supabase/migrations`](supabase/migrations):
   `0001_init.sql` y luego `0002_profile_avatar.sql`.
   - Si el proyecto MCP de Supabase está conectado (ver más abajo), es más
     fiable pedir que se apliquen así, ya que el SQL Editor del panel a
     veces se conecta con un rol (`authenticated`) que no es propietario de
     las tablas y algunas sentencias (`alter table`, `insert into
     storage.buckets`) fallan con "must be owner"/RLS. En ese caso, toca
     hacer esas dos operaciones concretas desde el Table Editor y Storage
     (interfaz) en vez de SQL.
3. **Crear las 2 cuentas**: en **Authentication → Users → Add user**, crea
   una cuenta para cada uno:
   - **Email**: `nombredeusuario@ditirambo.local` (el nombre de usuario con
     el que se entrará en la app, en minúsculas y sin espacios/acentos).
   - **Password**: la que queráis.
   - Marca **Auto Confirm User** (el email no es real, no puede confirmarse
     por correo).
   - En **User Metadata**, añade `{"display_name": "Tu nombre"}` para que
     aparezca así en la app.
4. **Copiar las claves**: en **Project Settings → API**, copia el *Project
   URL*, la *Publishable key* y la *Secret key*.
5. **Configurar variables de entorno**: abre `.env.local` en la raíz del
   proyecto (ya existe; si no existiera, se crea copiando
   `.env.local.example`) y pega ahí esos tres valores
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` con la
   Publishable key, y `SUPABASE_SECRET_KEY`).

## Conectar Supabase por MCP (opcional, para trabajar con Claude)

El proyecto incluye [`.mcp.json`](.mcp.json) apuntando al servidor MCP remoto
de Supabase, ya restringido a este proyecto. Para activarlo:

1. Genera un token en [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens).
2. Guárdalo como variable de entorno `SUPABASE_ACCESS_TOKEN` en tu máquina
   (no se comparte ni se sube a ningún sitio).
3. Reinicia Claude Code para que recoja la conexión (pedirá aprobarla la
   primera vez).

Con esto, los cambios de esquema se pueden aplicar directamente contra el
proyecto real sin copiar/pegar SQL a mano, evitando el problema de permisos
mencionado en el paso 2 de arriba.

## Desarrollo local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) y entra con uno de los
2 nombres de usuario creados en Supabase.

## Despliegue (Vercel)

1. Sube este repositorio a GitHub (o conéctalo directamente desde el CLI de
   Vercel).
2. Importa el repositorio en [vercel.com/new](https://vercel.com/new).
3. Añade las mismas 3 variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY`) en la
   configuración del proyecto en Vercel. Marca `SUPABASE_SECRET_KEY` como
   variable sensible/secreta si Vercel lo permite.
4. Despliega. Al abrir la URL desde el móvil, el navegador ofrecerá
   "Añadir a pantalla de inicio" para instalarla como PWA.
