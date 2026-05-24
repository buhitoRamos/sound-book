import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import JobsForm from '../components/JobsList/JobsForm'

// Mock supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
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

vi.mock('../lib/googleCalendar', () => ({
  initGoogleCalendar: vi.fn(),
  createCalendarEvent: vi.fn(),
}))

describe('JobsForm', () => {
  const mockUser = { id: 1, user: 'test' }

  it('renders form fields', () => {
    render(<JobsForm initial={{ id: 1, job: 'Test', amount: '', currency: 'ars', work_status: 'in_progress', expenses: '', exp_currency: 'ars', payment_currency: 'ars', payment_amount: '' }} user={mockUser} onSaved={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByPlaceholderText(/descripción del trabajo/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Monto')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Pago')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Gastos')).toBeInTheDocument()
  })

  it('renders currency selects', () => {
    render(<JobsForm initial={{ id: 1, job: 'Test', amount: '', currency: 'ars', work_status: 'in_progress', expenses: '', exp_currency: 'ars', payment_currency: 'ars', payment_amount: '' }} user={mockUser} onSaved={vi.fn()} onCancel={vi.fn()} />)

    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBeGreaterThanOrEqual(2)
  })

  it('renders status select with options', () => {
    render(<JobsForm initial={{ id: 1, job: 'Test', amount: '', currency: 'ars', work_status: 'in_progress', expenses: '', exp_currency: 'ars', payment_currency: 'ars', payment_amount: '' }} user={mockUser} onSaved={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByText('En progreso')).toBeInTheDocument()
    expect(screen.getByText('Finalizado')).toBeInTheDocument()
    expect(screen.getByText('Cancelado')).toBeInTheDocument()
  })

  it('renders Guardar and Cancelar buttons', () => {
    render(<JobsForm initial={{ id: 1, job: 'Test', amount: '', currency: 'ars', work_status: 'in_progress', expenses: '', exp_currency: 'ars', payment_currency: 'ars', payment_amount: '' }} user={mockUser} onSaved={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })

  it('calls onCancel when cancel is clicked', () => {
    const onCancel = vi.fn()
    render(<JobsForm initial={{ id: 1, job: 'Test', amount: '', currency: 'ars', work_status: 'in_progress', expenses: '', exp_currency: 'ars', payment_currency: 'ars', payment_amount: '' }} user={mockUser} onSaved={vi.fn()} onCancel={onCancel} />)

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('prefills form when initial data is provided', () => {
    const initial = { id: 1, job: 'Masterización', amount: 100, currency: 'ars', work_status: 'in_progress', expenses: 10, exp_currency: 'ars', payment_currency: 'ars', payment_amount: 50, band_id: null }
    render(<JobsForm user={mockUser} initial={initial} onSaved={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByPlaceholderText(/descripción del trabajo/i)).toHaveValue('Masterización')
  })

  it('does not show Google Calendar section for regular user', () => {
    render(<JobsForm user={mockUser} onSaved={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.queryByText(/agregar al google calendar/i)).not.toBeInTheDocument()
  })
})