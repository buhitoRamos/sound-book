import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Help from '../components/Help/Help'

describe('Help', () => {
  it('renders the main title', () => {
    render(<Help />)
    expect(screen.getByText(/guía de uso/i)).toBeInTheDocument()
  })

  it('renders artists section', () => {
    render(<Help />)
    expect(screen.getByText(/artistas \/ bandas/i)).toBeInTheDocument()
  })

  it('renders jobs section', () => {
    render(<Help />)
    expect(screen.getByRole('heading', { name: /📁 trabajos/i })).toBeInTheDocument()
  })

  it('renders payments section', () => {
    render(<Help />)
    expect(screen.getByRole('heading', { name: /💳 pagos/i })).toBeInTheDocument()
  })

  it('renders earnings section', () => {
    render(<Help />)
    expect(screen.getByRole('heading', { name: /📈 ganancias/i })).toBeInTheDocument()
  })

  it('renders security section', () => {
    render(<Help />)
    expect(screen.getByText(/seguridad/i)).toBeInTheDocument()
  })

  it('renders tips section', () => {
    render(<Help />)
    expect(screen.getByText(/consejos/i)).toBeInTheDocument()
  })

  it('renders support email link', () => {
    render(<Help />)
    const link = screen.getByText(/contacta al administrador/i)
    expect(link.closest('a')).toHaveAttribute('href', 'mailto:cym.martin85@gmail.com')
  })

  it('renders footer brand', () => {
    render(<Help />)
    expect(screen.getByText(/buh.*to/i)).toBeInTheDocument()
  })
})