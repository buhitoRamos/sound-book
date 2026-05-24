import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import StatusBar from '../components/StatusBar/StatusBar'

// Mock toast — toast is called as a function (not toast.success) for some calls in StatusBar
vi.mock('react-hot-toast', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
  Toaster: () => null,
}))

// Mock SVG import
vi.mock('../assets/music-note.svg', () => ({
  default: 'music-note.svg',
}))

describe('StatusBar', () => {
  it('renders the title', () => {
    render(<StatusBar title="Dashboard" onLogout={vi.fn()} onMenuSelect={vi.fn()} />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders hamburger button', () => {
    render(<StatusBar title="Dashboard" onLogout={vi.fn()} onMenuSelect={vi.fn()} />)
    expect(screen.getByLabelText(/abrir menú/i)).toBeInTheDocument()
  })

  it('opens menu on hamburger click', () => {
    render(<StatusBar title="Dashboard" onLogout={vi.fn()} onMenuSelect={vi.fn()} />)
    fireEvent.click(screen.getByLabelText(/abrir menú/i))
    expect(screen.getByText(/artistas \/ bandas/i)).toBeInTheDocument()
  })

  it('shows menu items for regular user', () => {
    render(<StatusBar title="Dashboard" onLogout={vi.fn()} onMenuSelect={vi.fn()} />)
    fireEvent.click(screen.getByLabelText(/abrir menú/i))
    expect(screen.getByText(/cambiar contraseña/i)).toBeInTheDocument()
    expect(screen.getByText(/trabajos/i)).toBeInTheDocument()
    expect(screen.getByText(/pagos/i)).toBeInTheDocument()
    expect(screen.getByText(/ganancias/i)).toBeInTheDocument()
    expect(screen.getByText(/ayuda/i)).toBeInTheDocument()
    expect(screen.getByText(/cerrar sesión/i)).toBeInTheDocument()
  })

  it('shows admin menu items when adminOnlyMenu is true', () => {
    render(<StatusBar title="Admin" onLogout={vi.fn()} onMenuSelect={vi.fn()} adminOnlyMenu={true} />)
    fireEvent.click(screen.getByLabelText(/abrir menú/i))
    expect(screen.getByText(/cerrar sesión/i)).toBeInTheDocument()
    expect(screen.queryByText(/artistas \/ bandas/i)).not.toBeInTheDocument()
  })

  it('calls onMenuSelect when menu item is clicked', () => {
    const onMenuSelect = vi.fn()
    render(<StatusBar title="Dashboard" onLogout={vi.fn()} onMenuSelect={onMenuSelect} />)
    fireEvent.click(screen.getByLabelText(/abrir menú/i))
    fireEvent.click(screen.getByText(/trabajos/i))
    expect(onMenuSelect).toHaveBeenCalledWith('jobs')
  })

  it('calls onLogout when logout is clicked', () => {
    const onLogout = vi.fn()
    render(<StatusBar title="Dashboard" onLogout={onLogout} onMenuSelect={vi.fn()} />)
    fireEvent.click(screen.getByLabelText(/abrir menú/i))
    fireEvent.click(screen.getByText(/cerrar sesión/i))
    expect(onLogout).toHaveBeenCalled()
  })

  it('renders support link in regular menu', () => {
    render(<StatusBar title="Dashboard" onLogout={vi.fn()} onMenuSelect={vi.fn()} />)
    fireEvent.click(screen.getByLabelText(/abrir menú/i))
    const supportLink = screen.getByText(/soporte/i)
    expect(supportLink).toBeInTheDocument()
  })
})