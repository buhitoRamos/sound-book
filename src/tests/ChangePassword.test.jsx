import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ChangePassword from '../components/ChangePassword/ChangePassword'

// Mock supabase
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockUpdate = vi.fn()

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
      update: mockUpdate,
    })),
  },
}))

// Mock toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}))

describe('ChangePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelect.mockReturnValue({
      eq: mockEq,
    })
  })

  it('renders the form with all fields', () => {
    render(<ChangePassword user={{ user: 'test' }} onDone={vi.fn()} onLogout={vi.fn()} />)

    expect(screen.getByText('Cambiar contraseña')).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña actual/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nueva contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })

  it('shows error when submitting with empty fields', async () => {
    render(<ChangePassword user={{ user: 'test' }} onDone={vi.fn()} onLogout={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(screen.getByText(/completa ambos campos/i)).toBeInTheDocument()
    })
  })

  it('toggles password visibility for current password', () => {
    render(<ChangePassword user={{ user: 'test' }} onDone={vi.fn()} onLogout={vi.fn()} />)

    const currentPassInput = screen.getByLabelText(/contraseña actual/i)
    expect(currentPassInput).toHaveAttribute('type', 'password')

    // First toggle button (for current password)
    const toggleButtons = screen.getAllByRole('button', { name: /mostrar/i })
    fireEvent.click(toggleButtons[0])
    expect(currentPassInput).toHaveAttribute('type', 'text')
  })

  it('toggles password visibility for new password', () => {
    render(<ChangePassword user={{ user: 'test' }} onDone={vi.fn()} onLogout={vi.fn()} />)

    const newPassInput = screen.getByLabelText(/nueva contraseña/i)
    expect(newPassInput).toHaveAttribute('type', 'password')

    const toggleBtns = screen.getAllByRole('button', { name: /mostrar/i })
    fireEvent.click(toggleBtns[1])
    expect(newPassInput).toHaveAttribute('type', 'text')
  })

  it('calls onDone when cancel is clicked', () => {
    const onDone = vi.fn()
    render(<ChangePassword user={{ user: 'test' }} onDone={onDone} onLogout={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onDone).toHaveBeenCalled()
  })

  it('shows helper text for new password', () => {
    render(<ChangePassword user={{ user: 'test' }} onDone={vi.fn()} onLogout={vi.fn()} />)

    expect(screen.getByText(/usa al menos 8 caracteres/i)).toBeInTheDocument()
  })

  it('shows error when user not found in db', async () => {
    const { supabase } = await import('../lib/supabaseClient')

    // Mock: supabase.from('users').select(...).eq(...).limit(1) returns empty data
    const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockEq = vi.fn().mockReturnValue({ limit: mockLimit })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    supabase.from.mockReturnValue({ select: mockSelect, update: vi.fn() })

    render(<ChangePassword user={{ user: 'test' }} onDone={vi.fn()} onLogout={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/contraseña actual/i), { target: { value: 'oldpass' } })
    fireEvent.change(screen.getByLabelText(/nueva contraseña/i), { target: { value: 'newpass123' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(screen.getByText(/usuario no encontrado/i)).toBeInTheDocument()
    })
  })
})