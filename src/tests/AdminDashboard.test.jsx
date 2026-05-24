import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AdminDashboard from '../pages/admin-dashboard/AdminDashboard'

// Mock StatusBar
vi.mock('../components/StatusBar/StatusBar', () => ({
  default: ({ onLogout, onMenuSelect }) => (
    <div data-testid="statusbar-mock">
      <button onClick={() => onMenuSelect && onMenuSelect('payments')}>Pagos</button>
      <button onClick={() => onMenuSelect && onMenuSelect('profile')}>Perfil</button>
      <button onClick={() => onMenuSelect && onMenuSelect('help')}>Ayuda</button>
      <button onClick={onLogout}>Cerrar sesión</button>
    </div>
  ),
}))

// Mock ChangePassword
vi.mock('../components/ChangePassword/ChangePassword', () => ({
  default: ({ onDone }) => (
    <div data-testid="changepass-mock">
      <button onClick={onDone}>Done</button>
    </div>
  ),
}))

// Mock AdminPayments
vi.mock('../components/AdminPayments/AdminPayments', () => ({
  default: () => <div data-testid="admin-payments-mock">Admin Payments</div>,
}))

// Mock Spinner
vi.mock('../components/Spinner/Spinner', () => ({
  default: () => <div data-testid="spinner-mock">Loading</div>,
}))

describe('AdminDashboard', () => {
  const mockUser = { id: 1, user: 'admin', role: 'admin' }
  const mockOnLogout = vi.fn()

  it('renders with default payments view', () => {
    render(<AdminDashboard user={mockUser} onLogout={mockOnLogout} />)
    expect(screen.getByText(/gestión de pagos mensuales/i)).toBeInTheDocument()
    expect(screen.getByText(/administrador: admin/i)).toBeInTheDocument()
  })

  it('shows AdminPayments component by default', () => {
    render(<AdminDashboard user={mockUser} onLogout={mockOnLogout} />)
    expect(screen.getByTestId('admin-payments-mock')).toBeInTheDocument()
  })

  it('switches to change password view', () => {
    render(<AdminDashboard user={mockUser} onLogout={mockOnLogout} />)
    fireEvent.click(screen.getByText('Perfil'))
    expect(screen.getByTestId('changepass-mock')).toBeInTheDocument()
  })

  it('switches to help view', () => {
    render(<AdminDashboard user={mockUser} onLogout={mockOnLogout} />)
    fireEvent.click(screen.getByText('Ayuda'))
    expect(screen.getByText(/en esta sección puedes gestionar/i)).toBeInTheDocument()
  })

  it('calls onLogout', () => {
    render(<AdminDashboard user={mockUser} onLogout={mockOnLogout} />)
    fireEvent.click(screen.getByText('Cerrar sesión'))
    expect(mockOnLogout).toHaveBeenCalled()
  })
})