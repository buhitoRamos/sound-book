import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Spinner from '../components/Spinner/Spinner'

describe('Spinner', () => {
  it('renders with default size', () => {
    const { container } = render(<Spinner />)
    expect(container.querySelector('.spinner-root')).toBeInTheDocument()
    expect(container.querySelector('.spinner')).toBeInTheDocument()
  })

  it('renders with custom size', () => {
    const { container } = render(<Spinner size={60} />)
    const spinner = container.querySelector('.spinner')
    expect(spinner).toHaveStyle({ width: '60px', height: '60px' })
  })

  it('renders message when provided', () => {
    render(<Spinner message="Cargando..." />)
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('does not render message when not provided', () => {
    const { container } = render(<Spinner />)
    expect(container.querySelector('.spinner-msg')).toBeNull()
  })

  it('renders SVG circle inside spinner', () => {
    const { container } = render(<Spinner />)
    expect(container.querySelector('svg circle')).toBeInTheDocument()
  })
})