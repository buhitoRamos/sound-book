import React, { useEffect, useRef, useState } from 'react'
import { sendSupportMessage } from '../../lib/supportChat'
import './SupportChat.css'

export default function SupportChat({ user, open, onOpen, onClose }) {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const messagesRef = useRef(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages, sending])

  async function handleSubmit(event) {
    event.preventDefault()
    const content = draft.trim()
    if (!content || sending) return

    const updatedMessages = [...messages, { role: 'user', content }]
    setMessages(updatedMessages)
    setDraft('')
    setError('')
    setSending(true)

    try {
      const reply = await sendSupportMessage(updatedMessages.slice(-12), user?.email)
      setMessages([...updatedMessages, { role: 'assistant', content: reply }])
    } catch (requestError) {
      setMessages(messages)
      setDraft(content)
      setError(requestError.message || 'No se pudo enviar el mensaje. Inténtalo nuevamente.')
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function handleClear() {
    setMessages([])
    setDraft('')
    setError('')
  }

  return (
    <div className="support-chat">
      {!open && (
        <button
          type="button"
          className="support-chat-trigger"
          aria-label="Abrir chat de soporte"
          onClick={onOpen}
        >
          <span aria-hidden="true">💬</span>
          <span className="support-chat-trigger-label">Buhobot</span>
        </button>
      )}

      {open && (
        <section className="support-chat-panel" role="dialog" aria-label="Chat de soporte Buhobot">
          <header className="support-chat-header">
            <div>
              <strong>Buhobot</strong>
              <span>Asistente de Sound-Book</span>
            </div>
            <button
              type="button"
              className="support-chat-clear"
              onClick={handleClear}
              disabled={sending || (!messages.length && !draft && !error)}
            >
              Borrar charla
            </button>
            <button type="button" aria-label="Cerrar chat" onClick={onClose}>×</button>
          </header>

          <div className="support-chat-messages" role="log" aria-live="polite" ref={messagesRef}>
            <p className="support-chat-welcome">
              Hola, soy Buhobot. ¿En qué puedo ayudarte con Sound-Book?
            </p>
            {messages.map((message, index) => (
              <p
                className={`support-chat-message ${message.role}`}
                key={`${message.role}-${index}`}
              >
                {message.content}
              </p>
            ))}
            {sending && <p className="support-chat-status">Buhobot está escribiendo…</p>}
          </div>

          {error && <p className="support-chat-error" role="alert">{error}</p>}

          <form className="support-chat-form" onSubmit={handleSubmit}>
            <label className="support-chat-sr-only" htmlFor="support-chat-input">
              Escribe tu mensaje
            </label>
            <input
              id="support-chat-input"
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Escribe tu consulta…"
              disabled={sending}
            />
            <button type="submit" disabled={sending || !draft.trim()}>
              {sending ? 'Enviando…' : 'Enviar'}
            </button>
          </form>
        </section>
      )}
    </div>
  )
}
