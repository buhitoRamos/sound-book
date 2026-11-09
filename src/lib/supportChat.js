function getAssistantReply(data) {
  if (typeof data === 'string') return data.trim()

  const reply =
    data?.reply ??
    data?.response ??
    data?.message ??
    data?.answer ??
    data?.choices?.[0]?.message?.content

  if (typeof reply === 'string') return reply.trim()
  if (typeof reply?.content === 'string') return reply.content.trim()
  return ''
}

export async function sendSupportMessage(messages, userEmail) {
  const supportChatUrl = import.meta.env.VITE_SUPPORT_CHAT_URL?.trim()
  const publicKey = import.meta.env.VITE_SUPPORT_CHAT_PUBLIC_KEY?.trim()

  if (!supportChatUrl) {
    throw new Error('El chatbot no está configurado. Contacta al administrador.')
  }
  if (!publicKey) {
    throw new Error('Al chatbot le falta la clave pública de soporte. Contacta al administrador.')
  }

  const headers = { 'Content-Type': 'application/json' }
  headers.apikey = publicKey
  headers.Authorization = `Bearer ${publicKey}`

  let response
  try {
    response = await fetch(supportChatUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        app: 'sound-book',
        messages,
        ...(userEmail ? { user_email: userEmail } : {}),
      }),
    })
  } catch {
    throw new Error('No se pudo conectar con el servicio de soporte. Revisa tu conexión e inténtalo nuevamente.')
  }

  let data
  try {
    data = await response.json()
  } catch {
    if (!response.ok) {
      throw new Error(`No se pudo obtener respuesta del soporte (HTTP ${response.status}).`)
    }
    throw new Error('El servicio de soporte devolvió una respuesta inválida.')
  }

  if (!response.ok) {
    throw new Error(`No se pudo obtener respuesta del soporte (HTTP ${response.status}).`)
  }

  const reply = getAssistantReply(data)
  if (!reply) {
    throw new Error('El servicio de soporte no devolvió una respuesta válida.')
  }

  return reply
}
