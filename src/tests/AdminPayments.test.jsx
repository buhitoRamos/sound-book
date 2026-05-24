import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Must use vi.fn() inside vi.mock - not references to outer variables
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}))

vi.mock('../components/Spinner/Spinner', () => ({
  default: ({ message }) => <div data-testid="spinner">{message}</div>,
}))

vi.mock('../components/AdminPayments/AdminPayments.css', () => ({}))

import AdminPayments from '../components/AdminPayments/AdminPayments'
import { supabase } from '../lib/supabaseClient'

function setupMock({ users = [], payments = [] } = {}) {
  // Default: users query → select().neq().order()
  supabase.from.mockImplementation((table) => {
    if (table === 'users') {
      return {
        select: vi.fn().mockReturnValue({
          neq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: users, error: null }),
          }),
        }),
      }
    }
    if (table === 'admin_payments') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: payments, error: null }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      }
    }
    return { select: vi.fn() }
  })
}

describe('AdminPayments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders tab buttons', () => {
    setupMock()
    render(<AdminPayments user={{ id: 1, role: 'admin' }} />)
    expect(screen.getByText(/registrar pago/i)).toBeInTheDocument()
    expect(screen.getByText(/ver historial/i)).toBeInTheDocument()
  })

  it('shows user selection dropdown', () => {
    setupMock()
    render(<AdminPayments user={{ id: 1, role: 'admin' }} />)
    expect(screen.getByText(/elige un usuario/i)).toBeInTheDocument()
  })

  it('switches to view mode when Ver Historial is clicked', async () => {
    setupMock()
    render(<AdminPayments user={{ id: 1, role: 'admin' }} />)

    fireEvent.click(screen.getByText(/ver historial/i))

    await waitFor(() => {
      expect(screen.getByText(/historial completo de pagos/i)).toBeInTheDocument()
    })
  })

  it('shows no payments message in view mode', async () => {
    setupMock()
    render(<AdminPayments user={{ id: 1, role: 'admin' }} />)

    fireEvent.click(screen.getByText(/ver historial/i))

    await waitFor(() => {
      expect(screen.getByText(/no hay pagos registrados/i)).toBeInTheDocument()
    })
  })

  it('renders register form in register mode', () => {
    setupMock()
    render(<AdminPayments user={{ id: 1, role: 'admin' }} />)
    expect(screen.getByText(/registrar pago/i)).toBeInTheDocument()
  })

  it('renders filter by user in view mode', async () => {
    setupMock()
    render(<AdminPayments user={{ id: 1, role: 'admin' }} />)

    fireEvent.click(screen.getByText(/ver historial/i))

    await waitFor(() => {
      expect(screen.getByText(/filtrar por usuario/i)).toBeInTheDocument()
    })
  })

  it('renders user dropdown after users load', async () => {
    setupMock({ users: [{ id: 2, user: 'testuser', role: 'user' }] })
    render(<AdminPayments user={{ id: 1, role: 'admin' }} />)

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument()
    })
  })
})