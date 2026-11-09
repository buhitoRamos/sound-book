import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import SupportChat from '../components/SupportChat/SupportChat'

describe('SupportChat', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SUPPORT_CHAT_URL', 'https://support.example.test/functions/v1/support-chat')
    vi.stubEnv('VITE_SUPPORT_CHAT_PUBLIC_KEY', 'public-test-key')
    vi.stubGlobal('fetch', vi.fn())
  })

  it('sends the Sound-Book conversation and shows the assistant reply', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ reply: 'Puedes crear trabajos desde Artistas / Bandas.' }),
    })
    render(<SupportChat user={{ email: 'user@example.test' }} open onOpen={vi.fn()} onClose={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/escribe tu mensaje/i), {
      target: { value: '¿Cómo creo un trabajo?' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    await waitFor(() => {
      expect(screen.getByText('Puedes crear trabajos desde Artistas / Bandas.')).toBeInTheDocument()
    })

    expect(fetch).toHaveBeenCalledWith(
      'https://support.example.test/functions/v1/support-chat',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: 'public-test-key',
          Authorization: 'Bearer public-test-key',
        },
        body: JSON.stringify({
          app: 'sound-book',
          messages: [{ role: 'user', content: '¿Cómo creo un trabajo?' }],
          user_email: 'user@example.test',
        }),
      }),
    )
  })

  it('shows a loading state while waiting for the chatbot', async () => {
    let resolveRequest
    fetch.mockReturnValue(new Promise((resolve) => { resolveRequest = resolve }))
    render(<SupportChat open onOpen={vi.fn()} onClose={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/escribe tu mensaje/i), {
      target: { value: 'Necesito ayuda' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(screen.getByText(/buhobot está escribiendo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviando/i })).toBeDisabled()

    resolveRequest({ ok: true, json: async () => ({ reply: 'Aquí estoy.' }) })
    await screen.findByText('Aquí estoy.')
  })

  it('shows a clear error for HTTP failures and keeps the message available to retry', async () => {
    fetch.mockResolvedValue({ ok: false, status: 503, json: async () => ({}) })
    render(<SupportChat open onOpen={vi.fn()} onClose={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/escribe tu mensaje/i), {
      target: { value: 'Hola' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/http 503/i)
    expect(screen.getByLabelText(/escribe tu mensaje/i)).toHaveValue('Hola')
  })

  it('reports missing endpoint configuration instead of inventing a reply', async () => {
    vi.stubEnv('VITE_SUPPORT_CHAT_URL', '')
    render(<SupportChat open onOpen={vi.fn()} onClose={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/escribe tu mensaje/i), {
      target: { value: 'Hola' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/no está configurado/i)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('shows network failures explicitly', async () => {
    fetch.mockRejectedValue(new Error('offline'))
    render(<SupportChat open onOpen={vi.fn()} onClose={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/escribe tu mensaje/i), {
      target: { value: 'Hola' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo conectar/i)
  })
})
