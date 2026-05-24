import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Login from '../pages/login/Login'

// Mock supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
    })),
  },
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}))

// Mock SVG import
vi.mock('../assets/music-note.svg', () => ({
  default: 'music-note.svg',
}))

describe('Login', () => {
  it('renders the login form with all fields', () => {
    render(<Login onLogin={vi.fn()} />)

    expect(screen.getByText('Sound-Book')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('ej. admin')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('tu contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument()
  })

  it('shows error when submitting with empty fields', async () => {
    render(<Login onLogin={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(screen.getByText(/por favor ingresa usuario y contraseña/i)).toBeInTheDocument()
    })
  })

  it('shows error when only username is provided', async () => {
    render(<Login onLogin={vi.fn()} />)

    const usernameInput = screen.getByPlaceholderText('ej. admin')
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(screen.getByText(/por favor ingresa usuario y contraseña/i)).toBeInTheDocument()
    })
  })

  it('shows WhatsApp support link', () => {
    render(<Login onLogin={vi.fn()} />)

    const link = screen.getByText(/no tenés cuenta/i)
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', expect.stringContaining('wa.me'))
  })

  it('renders footer with brand name', () => {
    render(<Login onLogin={vi.fn()} />)

    expect(screen.getByText(/buh.*software/i)).toBeInTheDocument()
  })

  it('calls onLogin on successful login', async () => {
    const mockOnLogin = vi.fn()
    const { supabase } = await import('../lib/supabaseClient')

    supabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: [{ id: 1, user: 'admin', pass: '1234', role: 'user', session_version: 1 }],
            error: null,
          })),
        })),
      })),
    })

    render(<Login onLogin={mockOnLogin} />)

    fireEvent.change(screen.getByPlaceholderText('ej. admin'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByPlaceholderText('tu contraseña'), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled()
    })
  })

  it('shows error for incorrect password', async () => {
    const { supabase } = await import('../lib/supabaseClient')

    supabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: [{ id: 1, user: 'admin', pass: 'correctpass', role: 'user', session_version: 1 }],
            error: null,
          })),
        })),
      })),
    })

    render(<Login onLogin={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText('ej. admin'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByPlaceholderText('tu contraseña'), { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(screen.getByText(/contraseña incorrecta/i)).toBeInTheDocument()
    })
  })

  it('shows error for user not found', async () => {
    const { supabase } = await import('../lib/supabaseClient')

    supabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
    })

    render(<Login onLogin={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText('ej. admin'), { target: { value: 'nonexistent' } })
    fireEvent.change(screen.getByPlaceholderText('tu contraseña'), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(screen.getByText(/usuario no encontrado/i)).toBeInTheDocument()
    })
  })

  it('disables button while loading', async () => {
    const { supabase } = await import('../lib/supabaseClient')

    supabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          limit: vi.fn(() => new Promise(() => {})),
        })),
      })),
    })

    render(<Login onLogin={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText('ej. admin'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByPlaceholderText('tu contraseña'), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ingresando/i })).toBeDisabled()
    })
  })
})