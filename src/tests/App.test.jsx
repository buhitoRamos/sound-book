import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import App from '../App'

// Mock supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: true })),
        })),
      })),
    })),
  },
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}))

// Mock Login
vi.mock('../pages/login/Login', () => ({
  default: ({ onLogin }) => (
    <div data-testid="login-mock">
      <button onClick={() => onLogin({ token: 'test', user: { id: 1, user: 'test', role: 'user' } })}>
        Mock Login
      </button>
    </div>
  ),
}))

// Mock Dashboard
vi.mock('../pages/dashboard/Dashboard', () => ({
  default: ({ user, onLogout }) => (
    <div data-testid="dashboard-mock">
      <span>Dashboard for {user?.user}</span>
      <button onClick={onLogout}>Logout</button>
    </div>
  ),
}))

// Mock AdminDashboard
vi.mock('../pages/admin-dashboard/AdminDashboard', () => ({
  default: ({ user, onLogout }) => (
    <div data-testid="admin-mock">
      <span>Admin for {user?.user}</span>
      <button onClick={onLogout}>Logout</button>
    </div>
  ),
}))

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows login when no user session exists', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('login-mock')).toBeInTheDocument()
    })
  })

  it('shows dashboard after login', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('login-mock')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Mock Login'))

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument()
    })
  })

  it('shows login after logout', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('login-mock')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Mock Login'))

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Logout'))

    await waitFor(() => {
      expect(screen.getByTestId('login-mock')).toBeInTheDocument()
    })
  })
})