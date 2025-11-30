# sound-book

Plantilla mínima de React + Vite para el proyecto `sound-book`.

Instrucciones rápidas:

1. Instalar dependencias:

```bash
npm install
```

2. Instalar cliente de Supabase:

```bash
npm install @supabase/supabase-js
```

3. Variables de entorno (archivo `.env` o en el entorno):

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Iniciar servidor de desarrollo:

```bash
npm run dev
```

5. Construir para producción:

```bash
npm run build
```

La app espera una tabla `users` en Supabase con al menos las columnas: `id`, `user`, `pass`.

IMPORTANTE: en este ejemplo la verificación de contraseña se hace en texto plano solo para demo. En producción debes usar hashing seguro (bcrypt) o usar el sistema de Auth de Supabase.

Seed de prueba
----------------
Si quieres insertar el usuario de prueba `cc` / `cc` con los valores que enviaste, ejecuta:

```bash
npm install @supabase/supabase-js
node --input-type=module scripts/seed_users.mjs
```

Esto usa las claves embebidas en el script (solo para desarrollo).

El código fuente está en `src/`.

Archivos creados:

- `index.html` — punto de entrada HTML
- `package.json` — scripts y dependencias mínimas
- `src/main.jsx` — arranque de React
- `src/App.jsx` — componente principal
- `src/index.css` — estilos básicos
- `.gitignore` — archivos ignorados

Sesión en el navegador
----------------------
Al iniciar sesión la app guarda en `localStorage` la sesión bajo la clave `sb_session` con la forma:

```json
{ "token": "<token>", "user": { "id": <id>, "user": "cc" } }
```

La sesión se mantiene hasta que el usuario cierre sesión (botón en el dashboard) o se borre el `localStorage`.

Usar la nota musical como icono de la app
--------------------------------------
He añadido `manifest.webmanifest` y enlaces en `index.html` para que el SVG `src/assets/music-note.svg` se utilice como icono cuando se agregue la app a la pantalla de inicio en dispositivos móviles (o se muestre como favicon en navegadores compatibles).

Notas:
- Algunos navegadores (especialmente iOS Safari) prefieren un PNG para `apple-touch-icon`. Si quieres soporte máximo, puedo generar PNGs de distintos tamaños y añadirlos.
- Para probar: abre en un móvil moderno, usa "Agregar a pantalla de inicio" y debería usar la nota musical como icono.