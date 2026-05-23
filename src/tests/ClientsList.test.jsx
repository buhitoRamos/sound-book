import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ClientsList from '../components/ClientsList/ClientsList'

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

vi.mock('../components/ClientsList/ClientsForm', () => ({
  default: ({ user, initial, onSaved, onCancel }) => (
    <div data-testid="clients-form-mock">
      <button onClick={() => onSaved && onSaved()}>Save</button>
      <button onClick={() => onCancel && onCancel()}>Cancel</button>
    </div>
  ),
}))

vi.mock('../components/JobsList/JobsForm', () => ({
  default: ({ user, onSaved, onCancel }) => (
    <div data-testid="jobs-form-mock">
      <button onClick={() => onSaved && onSaved()}>Save Job</button>
      <button onClick={() => onCancel && onCancel()}>Cancel Job</button>
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
        <button onClick={onConfirm}>Confirm Modal</button>
      </div>
    ) : null,
}))

describe('ClientsList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows message when user is not logged in', () => {
    render(<ClientsList user={null} />)
    expect(screen.getByText(/inicia sesión para ver tus clientes/i)).toBeInTheDocument()
  })

  it('renders the clients header', () => {
    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockResolvedValue({ data: [], error: null }),
      }),
    })

    render(<ClientsList user={{ id: 1, user: 'test' }} />)
    expect(screen.getByText(/clientes totales/i)).toBeInTheDocument()
  })

  it('renders search input and new button', async () => {
    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockResolvedValue({ data: [], error: null }),
      }),
    })

    render(<ClientsList user={{ id: 1, user: 'test' }} />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/buscar artistas/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /nuevo/i })).toBeInTheDocument()
    })
  })

  it('shows empty message when no clients', async () => {
    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockResolvedValue({ data: [], error: null }),
      }),
    })

    render(<ClientsList user={{ id: 1, user: 'test' }} />)

    await waitFor(() => {
      expect(screen.getByText(/no hay clientes registrados/i)).toBeInTheDocument()
    })
  })

  it('renders clients list when data is available', async () => {
    const clients = [
      { id: 1, name: 'Band A', gender: 'Rock', tel: '1234', email: 'a@test.com', user_id: 1 },
      { id: 2, name: 'Band B', gender: 'Jazz', tel: '5678', email: 'b@test.com', user_id: 1 },
    ]

    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockResolvedValue({ data: clients, error: null }),
      }),
    })

    render(<ClientsList user={{ id: 1, user: 'test' }} />)

    await waitFor(() => {
      expect(screen.getByText('Band A')).toBeInTheDocument()
      expect(screen.getByText('Band B')).toBeInTheDocument()
    })
  })

  it('shows form when New button is clicked', async () => {
    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockResolvedValue({ data: [], error: null }),
      }),
    })

    render(<ClientsList user={{ id: 1, user: 'test' }} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /nuevo/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /nuevo/i }))
    expect(screen.getByTestId('clients-form-mock')).toBeInTheDocument()
  })

  it('filters clients by search text', async () => {
    const clients = [
      { id: 1, name: 'Rock Band', gender: 'Rock', tel: '1234', email: 'rock@test.com', user_id: 1 },
      { id: 2, name: 'Jazz Group', gender: 'Jazz', tel: '5678', email: 'jazz@test.com', user_id: 1 },
    ]

    mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        order: mockOrder.mockResolvedValue({ data: clients, error: null }),
      }),
    })

    render(<ClientsList user={{ id: 1, user: 'test' }} />)

    await waitFor(() => {
      expect(screen.getByText('Rock Band')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByPlaceholderText(/buscar artistas/i), { target: { value: 'jazz' } })

    expect(screen.queryByText('Rock Band')).not.toBeInTheDocument()
    expect(screen.getByText('Jazz Group')).toBeInTheDocument()
  })
})