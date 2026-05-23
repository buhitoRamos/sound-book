import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Dashboard from '../pages/dashboard/Dashboard'

// Mock StatusBar
vi.mock('../components/StatusBar/StatusBar', () => ({
  default: ({ onLogout, onMenuSelect }) => (
    <div data-testid="statusbar-mock">
      <button onClick={() => onMenuSelect && onMenuSelect('artists')}>Artistas</button>
      <button onClick={() => onMenuSelect && onMenuSelect('jobs')}>Trabajos</button>
      <button onClick={() => onMenuSelect && onMenuSelect('payments')}>Pagos</button>
      <button onClick={() => onMenuSelect && onMenuSelect('earnings')}>Ganancias</button>
      <button onClick={() => onMenuSelect && onMenuSelect('help')}>Ayuda</button>
      <button onClick={() => onMenuSelect && onMenuSelect('profile')}>Perfil</button>
      <button onClick={onLogout}>Cerrar sesión</button>
    </div>
  ),
}))

// Mock ChangePassword
vi.mock('../components/ChangePassword/ChangePassword', () => ({
  default: ({ onDone, onLogout }) => (
    <div data-testid="changepass-mock">
      <button onClick={onDone}>Done</button>
    </div>
  ),
}))

// Mock ClientsList
vi.mock('../components/ClientsList/ClientsList', () => ({
  default: () => <div data-testid="clients-mock">Clients</div>,
}))

// Mock Spinner
vi.mock('../components/Spinner/Spinner', () => ({
  default: () => <div data-testid="spinner-mock">Loading</div>,
}))

// Mock JobsList
vi.mock('../components/JobsList/JobsList', () => ({
  default: () => <div data-testid="jobs-mock">Jobs</div>,
}))

// Mock Payments
vi.mock('../components/Payments/Payments', () => ({
  default: () => <div data-testid="payments-mock">Payments</div>,
}))

// Mock Earnings
vi.mock('../components/Earnings/Earnings', () => ({
  default: () => <div data-testid="earnings-mock">Earnings</div>,
}))

// Mock Help
vi.mock('../components/Help/Help', () => ({
  default: () => <div data-testid="help-mock">Help</div>,
}))

describe('Dashboard', () => {
  const mockUser = { id: 1, user: 'testuser' }
  const mockOnLogout = vi.fn()

  it('renders with default artists view', () => {
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />)
    expect(screen.getByText(/artistas \/ bandas/i)).toBeInTheDocument()
    expect(screen.getByText(/usuario: testuser/i)).toBeInTheDocument()
  })

  it('switches to jobs view', () => {
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />)
    fireEvent.click(screen.getByText('Trabajos'))
    expect(screen.getByTestId('jobs-mock')).toBeInTheDocument()
  })

  it('switches to payments view', () => {
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />)
    fireEvent.click(screen.getByText('Pagos'))
    expect(screen.getByTestId('payments-mock')).toBeInTheDocument()
  })

  it('switches to earnings view', () => {
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />)
    fireEvent.click(screen.getByText('Ganancias'))
    expect(screen.getByTestId('earnings-mock')).toBeInTheDocument()
  })

  it('switches to help view', () => {
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />)
    fireEvent.click(screen.getByText('Ayuda'))
    expect(screen.getByTestId('help-mock')).toBeInTheDocument()
  })

  it('switches to change password view', () => {
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />)
    fireEvent.click(screen.getByText('Perfil'))
    expect(screen.getByTestId('changepass-mock')).toBeInTheDocument()
  })

  it('calls onLogout when logout button is clicked', () => {
    render(<Dashboard user={mockUser} onLogout={mockOnLogout} />)
    fireEvent.click(screen.getByText('Cerrar sesión'))
    expect(mockOnLogout).toHaveBeenCalled()
  })
})