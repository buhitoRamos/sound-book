import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PaymentForm from '../components/Payments/PaymentForm'

// Mock supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
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

describe('PaymentForm', () => {
  const mockJobs = [
    { id: 1, job: 'Masterización', band_id: 1, amount: 100, currency: 'ars', work_status: 'in_progress', payment_amount: 50, payment_currency: 'ars', bands: { name: 'Band A' } },
  ]

  it('renders payment form with monto input', () => {
    render(<PaymentForm initial={null} jobs={mockJobs} onSaved={vi.fn()} onCancel={vi.fn()} user={{ id: 1 }} />)
    expect(screen.getByPlaceholderText('Monto')).toBeInTheDocument()
  })

  it('renders cancel button', () => {
    render(<PaymentForm initial={null} jobs={mockJobs} onSaved={vi.fn()} onCancel={vi.fn()} user={{ id: 1 }} />)
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
  })

  it('calls onCancel when cancel is clicked', () => {
    const onCancel = vi.fn()
    render(<PaymentForm initial={null} jobs={mockJobs} onSaved={vi.fn()} onCancel={onCancel} user={{ id: 1 }} />)
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('renders date input', () => {
    render(<PaymentForm initial={null} jobs={mockJobs} onSaved={vi.fn()} onCancel={vi.fn()} user={{ id: 1 }} />)
    expect(screen.getByLabelText(/fecha del pago/i)).toBeInTheDocument()
  })

  it('renders guardar button', () => {
    render(<PaymentForm initial={null} jobs={mockJobs} onSaved={vi.fn()} onCancel={vi.fn()} user={{ id: 1 }} />)
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument()
  })

  it('renders detail textarea', () => {
    render(<PaymentForm initial={null} jobs={mockJobs} onSaved={vi.fn()} onCancel={vi.fn()} user={{ id: 1 }} />)
    expect(screen.getByText(/detalle del pago/i)).toBeInTheDocument()
  })
})