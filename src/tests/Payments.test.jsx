import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Payments from '../components/Payments/Payments'

// Mock supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
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

vi.mock('../components/Payments/PaymentForm', () => ({
  default: ({ onSaved, onCancel, jobs, user }) => (
    <div data-testid="payment-form-mock">
      <button onClick={() => onSaved && onSaved()}>Save Payment</button>
      <button onClick={() => onCancel && onCancel()}>Cancel</button>
    </div>
  ),
}))

vi.mock('../components/Modal/Modal', () => ({
  default: ({ open, title, children, onCancel, onConfirm }) =>
    open ? (
      <div data-testid="modal-mock">
        <h3>{title}</h3>
        {children}
        <button onClick={onCancel}>Cancel Modal</button>
        <button onClick={onConfirm}>Confirm</button>
      </div>
    ) : null,
}))

vi.mock('../components/Payments/Payments.css', () => ({}))

describe('Payments', () => {
  it('renders payments component', async () => {
    render(<Payments user={{ id: 1 }} />)

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  it('renders band filter dropdown', async () => {
    render(<Payments user={{ id: 1 }} />)

    await waitFor(() => {
      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
      expect(screen.getByText(/todas las bandas/i)).toBeInTheDocument()
    })
  })
})