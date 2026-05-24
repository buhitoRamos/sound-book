import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import JobsList from '../components/JobsList/JobsList'

// Mock supabase
const mockEq = vi.fn()
const mockOrder = vi.fn()
const mockSelect = vi.fn()

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
      delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
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

vi.mock('../components/JobsList/JobsForm', () => ({
  default: ({ onSaved, onCancel, user }) => (
    <div data-testid="jobs-form-mock">
      <button onClick={() => onSaved && onSaved()}>Save Job</button>
      <button onClick={() => onCancel && onCancel()}>Cancel Job</button>
    </div>
  ),
}))

vi.mock('../components/Payments/PaymentForm', () => ({
  default: ({ onSaved, onCancel, jobs, user }) => (
    <div data-testid="payment-form-mock">
      <button onClick={() => onSaved && onSaved()}>Save Payment</button>
      <button onClick={() => onCancel && onCancel()}>Cancel Payment</button>
    </div>
  ),
}))

vi.mock('../components/Modal/Modal', () => ({
  default: ({ open, title, children, onCancel, onConfirm, confirmLabel }) =>
    open ? (
      <div data-testid="modal-mock">
        <h3>{title}</h3>
        {children}
        <button onClick={onCancel}>Cancel Modal</button>
        <button onClick={onConfirm}>{confirmLabel || 'Confirm'}</button>
      </div>
    ) : null,
}))

vi.mock('../components/JobsList/JobsList.css', () => ({}))

describe('JobsList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders jobs header', async () => {
    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockResolvedValue({ data: [], error: null }),
      }),
    })

    render(<JobsList user={{ id: 1 }} />)

    await waitFor(() => {
      expect(screen.getByText('Trabajos')).toBeInTheDocument()
    })
  })

  it('shows empty message when no jobs', async () => {
    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockResolvedValue({ data: [], error: null }),
      }),
    })

    render(<JobsList user={{ id: 1 }} />)

    await waitFor(() => {
      expect(screen.getByText(/no hay trabajos/i)).toBeInTheDocument()
    })
  })

  it('renders job list when data is available', async () => {
    const jobs = [
      { id: 1, job: 'Masterización', band_id: 1, amount: 100, currency: 'ars', work_status: 'in_progress', expenses: 10, exp_currency: 'ars', payment_amount: 50, payment_currency: 'ars', bands: { name: 'Band A' }, created_at: '2024-01-01' },
    ]

    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockResolvedValue({ data: jobs, error: null }),
      }),
    })

    render(<JobsList user={{ id: 1 }} />)

    await waitFor(() => {
      expect(screen.getByText('Masterización')).toBeInTheDocument()
    })
  })

  it('renders filter controls', async () => {
    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockResolvedValue({ data: [], error: null }),
      }),
    })

    render(<JobsList user={{ id: 1 }} />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/buscar trabajos/i)).toBeInTheDocument()
    })
  })
})