import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ClientsForm from '../components/ClientsList/ClientsForm'

// Mock supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        error: null,
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null,
        })),
      })),
    })),
  },
}))

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}))

vi.mock('../components/Spinner/Spinner', () => ({
  default: ({ message }) => <div data-testid="spinner">{message}</div>,
}))

describe('ClientsForm', () => {
  const mockUser = { id: 1, user: 'test' }

  it('renders form fields', () => {
    render(<ClientsForm user={mockUser} onSaved={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Género')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Teléfono')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
  })

  it('renders Guardar and Cancelar buttons', () => {
    render(<ClientsForm user={mockUser} onSaved={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })

  it('calls onCancel when cancel is clicked', () => {
    const onCancel = vi.fn()
    render(<ClientsForm user={mockUser} onSaved={vi.fn()} onCancel={onCancel} />)

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('shows error when submitting without name', async () => {
    const { toast } = await import('react-hot-toast')
    render(<ClientsForm user={mockUser} onSaved={vi.fn()} onCancel={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Nombre es requerido')
    })
  })

  it('prefills form when initial data is provided', () => {
    const initial = { id: 1, name: 'Test Band', gender: 'Rock', tel: '12345678', email: 'test@test.com' }
    render(<ClientsForm user={mockUser} initial={initial} onSaved={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByPlaceholderText('Nombre')).toHaveValue('Test Band')
    expect(screen.getByPlaceholderText('Género')).toHaveValue('Rock')
    expect(screen.getByPlaceholderText('Teléfono')).toHaveValue('12345678')
    expect(screen.getByPlaceholderText('Email')).toHaveValue('test@test.com')
  })

  it('shows spinner when loading', async () => {
    const { supabase } = await import('../lib/supabaseClient')
    // Make the insert hang
    supabase.from.mockReturnValue({
      insert: vi.fn(() => new Promise(() => {})),
      update: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) })),
    })

    render(<ClientsForm user={mockUser} onSaved={vi.fn()} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'Test Band' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
    })
  })
})