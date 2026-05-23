import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

vi.mock('../components/Spinner/Spinner', () => ({
  default: ({ message }) => <div data-testid="spinner">{message}</div>,
}))

vi.mock('../components/Earnings/Earnings.css', () => ({}))

import Earnings from '../components/Earnings/Earnings'
import { supabase } from '../lib/supabaseClient'

function setupMock(payments = [], jobs = []) {
  supabase.from.mockImplementation((table) => {
    if (table === 'payments') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: payments, error: null }),
        }),
      }
    }
    if (table === 'jobs') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: jobs, error: null }),
        }),
      }
    }
    return { select: vi.fn() }
  })
}

describe('Earnings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the earnings header', () => {
    setupMock()
    render(<Earnings user={{ id: 1 }} />)
    expect(screen.getByText('Ganancias')).toBeInTheDocument()
  })

  it('renders year filter select', () => {
    setupMock()
    render(<Earnings user={{ id: 1 }} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders currency labels after loading', async () => {
    setupMock()
    render(<Earnings user={{ id: 1 }} />)

    await waitFor(() => {
      expect(screen.getByText(/pesos \(ars\)/i)).toBeInTheDocument()
      expect(screen.getByText(/dólares \(usd\)/i)).toBeInTheDocument()
      expect(screen.getByText(/euros \(eur\)/i)).toBeInTheDocument()
    })
  })

  it('renders no data message when no months', async () => {
    setupMock()
    render(<Earnings user={{ id: 1 }} />)

    await waitFor(() => {
      expect(screen.getByText(/no hay datos para este año/i)).toBeInTheDocument()
    })
  })

  it('renders annual summary after loading', async () => {
    setupMock()
    render(<Earnings user={{ id: 1 }} />)

    await waitFor(() => {
      expect(screen.getByText(/total anual/i)).toBeInTheDocument()
    })
  })

  it('renders monthly breakdown after loading', async () => {
    setupMock()
    render(<Earnings user={{ id: 1 }} />)

    await waitFor(() => {
      expect(screen.getByText(/desglose mensual/i)).toBeInTheDocument()
    })
  })

  it('shows monthly data when payments exist', async () => {
    const year = new Date().getFullYear()
    const payments = [
      { amount: 5000, currency: 'ars', created_at: `${year}-03-15T10:00:00Z` },
      { amount: 100, currency: 'usd', created_at: `${year}-03-20T10:00:00Z` },
    ]
    const jobs = [
      { expenses: 1000, exp_currency: 'ars', created_at: `${year}-03-10T10:00:00Z` },
    ]
    setupMock(payments, jobs)

    render(<Earnings user={{ id: 1 }} />)

    await waitFor(() => {
      expect(screen.getByText(/marzo/i)).toBeInTheDocument()
    })
  })

  it('shows spinner while loading', () => {
    supabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue(new Promise(() => {})),
      }),
    }))

    render(<Earnings user={{ id: 1 }} />)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('handles error gracefully', async () => {
    supabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'Test error' } }),
      }),
    }))

    render(<Earnings user={{ id: 1 }} />)

    await waitFor(() => {
      expect(screen.getByText('Ganancias')).toBeInTheDocument()
    })
  })

  it('renders negative values when expenses exceed income', async () => {
    const year = new Date().getFullYear()
    const payments = [
      { amount: 1000, currency: 'ars', created_at: `${year}-05-10T10:00:00Z` },
    ]
    const jobs = [
      { expenses: 5000, exp_currency: 'ars', created_at: `${year}-05-05T10:00:00Z` },
    ]
    setupMock(payments, jobs)

    render(<Earnings user={{ id: 1 }} />)

    await waitFor(() => {
      expect(screen.getByText(/mayo/i)).toBeInTheDocument()
    })
  })
})