# Contexto de sound-book

Documento de referencia para trabajar en este repositorio. Mantenerlo breve y basado en el código y decisiones confirmadas; el código vigente prevalece si hay discrepancias.

## Tecnologías y comandos

- React 18 con JSX y Vite; instalación y scripts de desarrollo/build en `package.json`.
- Pruebas: Vitest, jsdom y React Testing Library. La suite está en `src/tests/`.
- Comandos: `npm run dev`, `npm test` y `npm run build`.
- Backend: Supabase, mediante el cliente compartido `src/lib/supabaseClient.js`.

## Organización y flujo principal

- `src/main.jsx` arranca la aplicación y `src/App.jsx` carga la sesión y muestra login, dashboard de administración o dashboard de usuario según el usuario autenticado.
- Las pantallas principales están en `src/pages/`; las funciones reutilizables, en `src/components/`; integraciones, en `src/lib/`.
- El dashboard de usuario combina barra de estado con secciones de artistas/bandas (clientes), trabajos, pagos, ganancias, ayuda, ajustes y cambio de contraseña.
- Las operaciones de datos se realizan principalmente desde los componentes contra Supabase. Sigue las consultas, tablas y manejo de errores ya presentes en el flujo que estés modificando; no deduzcas un esquema completo a partir de un solo componente.

## Chatbot de soporte Buhobot

- `src/App.jsx` monta el widget global `src/components/SupportChat/SupportChat.jsx`; está disponible desde la pantalla de inicio de sesión, el botón flotante y el menú de usuario.
- El cliente `src/lib/supportChat.js` envía un `POST` JSON a `VITE_SUPPORT_CHAT_URL`, con `app: "sound-book"`, el historial reciente `messages` (`role` user/assistant y `content`) y `user_email` opcional.
- La función compartida requiere la clave anónima pública de su proyecto Supabase central, distinta de la clave de la base propia de Sound-Book. Se configura mediante `VITE_SUPPORT_CHAT_PUBLIC_KEY` y se envía como `apikey` y `Authorization: Bearer`; la URL se configura mediante `VITE_SUPPORT_CHAT_URL`.
- No incluir claves service-role ni otros secretos en el cliente. `.env.local` está excluido de Git; producción requiere configurar esas variables en el hosting.
- El widget informa errores de configuración, red y HTTP; solo muestra respuestas devueltas por el servicio.

## Convenciones visuales y de código

- La interfaz y los mensajes visibles están en español.
- La base visual global está en `src/index.css`: fondo oscuro, variables CSS compartidas y reglas responsive/táctiles.
- Los componentes normalmente importan una hoja CSS adyacente con estilos de su propia pantalla o función. Revisa las hojas CSS cercanas antes de cambiar diseño.
- Los componentes son funciones React con hooks; las pruebas cubren componentes y flujos en archivos `*.test.*` bajo `src/tests/`.
- Mantén las convenciones del área que modificas, incluso si otros archivos usan variantes distintas. No hagas una refactorización de estilo global como parte de una tarea localizada.

## Mantenimiento de este documento

Añade aquí solo conocimiento reutilizable confirmado al implementar o revisar cambios: decisiones de arquitectura/diseño, flujos de usuario y contratos de datos verificados. No incluyas secretos, valores de entorno, credenciales ni notas temporales. Si una sección deja de ser cierta, corrígela en el mismo cambio.
