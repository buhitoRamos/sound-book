import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MembershipReminder from '../components/MembershipReminder/MembershipReminder'
import { fetchMembershipStatus } from '../lib/supportChat'

vi.mock('../lib/supportChat', () => ({
  fetchMembershipStatus: vi.fn(),
}))

describe('MembershipReminder', () => {
  beforeEach(() => {
    fetchMembershipStatus.mockResolvedValue({
      show: true,
      due_date: '2026-11-11',
      is_first_month: true,
      plan: 'Pro',
      amount: 15000,
      alias: 'martin.g.lopez',
    })
  })

  it('shows the free-month reminder, transfer details, and opens support chat', async () => {
    const onOpenChat = vi.fn()
    render(<MembershipReminder userEmail="user@example.test" onOpenChat={onOpenChat} />)

    expect(await screen.findByText(/tu primer mes gratis termina el 11\/11\/2026/i)).toBeInTheDocument()
    expect(screen.getByText(/martin\.g\.lopez/)).toBeInTheDocument()
    expect(screen.getByText(/\$15\.000/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /enviar comprobante/i }))
    expect(onOpenChat).toHaveBeenCalledOnce()
  })

  it('does not render when the server says no reminder is due', async () => {
    fetchMembershipStatus.mockResolvedValue({ show: false })
    render(<MembershipReminder userEmail="user@example.test" onOpenChat={vi.fn()} />)

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })
})
