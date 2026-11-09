# Instrucciones del proyecto

- Lee `.github/sound-book-project.agent.md` y los archivos relevantes antes de cambiar código; verifica el contexto en la implementación actual.
- Mantén la arquitectura React + Vite, la organización existente en `src/pages/`, `src/components/` y `src/lib/`, y los patrones ya usados para Supabase y pruebas.
- Preserva la identidad visual oscura, los tokens de `src/index.css`, los estilos CSS junto a cada componente y el español de la interfaz. No rehagas ni uniformes estilos fuera del alcance pedido.
- Prefiere cambios pequeños y coherentes con componentes vecinos. Añade o ajusta pruebas con Vitest/React Testing Library para el comportamiento modificado.
- Actualiza `.github/sound-book-project.agent.md` cuando un cambio confirme o altere una convención, arquitectura, flujo o decisión de diseño que sea útil para tareas futuras. Mantén el documento factual y breve; no registres cada avance ni supongas que el agente aprende automáticamente.

## Chatbot de soporte Buhobot

- El servicio compartido de soporte tiene una Supabase Edge Function `support-chat` y reconoce Sound-Book con el identificador exacto `sound-book`. En el backend compartido, esa app tiene su propia identidad, instrucciones y configuración de Supabase.
- El widget `src/components/SupportChat/SupportChat.jsx` se monta en `src/App.jsx` y es accesible desde login, el botón flotante y el menú de usuario.
- Se conecta a la Edge Function compartida configurada por `VITE_SUPPORT_CHAT_URL` y usa su clave anónima pública mediante `VITE_SUPPORT_CHAT_PUBLIC_KEY` (la del proyecto Supabase central, no la base propia de Sound-Book).
- El contrato de solicitud verificado es un `POST` JSON con `{ app: "sound-book", messages: [{ role: "user" | "assistant", content: string }], user_email?: string }`. Envía solo el historial conversacional necesario y el email de la sesión actual, si está disponible.
- Usa solo la clave anónima pública del proyecto Supabase central. Nunca incluyas service-role keys, tokens de Ollama/Telegram u otros secretos en React, variables `VITE_*`, commits o logs del navegador.
- Maneja explícitamente respuestas HTTP fallidas y errores de red; no muestres una respuesta de éxito inventada. Añade pruebas para el envío, loading, errores y el acceso al widget.
- Configura las variables locales en `.env.local` y las de producción en el hosting; no cambies la autenticación ni la base de datos propia de Sound-Book para conectar el soporte.
