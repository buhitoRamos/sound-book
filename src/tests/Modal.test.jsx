import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '../components/Modal/Modal'

describe('Modal', () => {
  it('renders nothing when open is false', () => {
    const { container } = render(
      <Modal open={false} title="Test">
        <p>Content</p>
      </Modal>
    )
    expect(container.querySelector('.modal-backdrop')).toBeNull()
  })

  it('renders modal when open is true', () => {
    render(
      <Modal open={true} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(
      <Modal open={true} title="Test" onCancel={onCancel}>
        <p>Content</p>
      </Modal>
    )
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn()
    render(
      <Modal open={true} title="Test" onConfirm={onConfirm}>
        <p>Content</p>
      </Modal>
    )
    fireEvent.click(screen.getByText('Confirmar'))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('uses custom confirm and cancel labels', () => {
    render(
      <Modal open={true} title="Test" confirmLabel="Sí" cancelLabel="No" onConfirm={vi.fn()} onCancel={vi.fn()}>
        <p>Content</p>
      </Modal>
    )
    expect(screen.getByText('Sí')).toBeInTheDocument()
    expect(screen.getByText('No')).toBeInTheDocument()
  })

  it('hides footer when showFooter is false', () => {
    const { container } = render(
      <Modal open={true} title="Test" showFooter={false}>
        <p>Content</p>
      </Modal>
    )
    expect(container.querySelector('.modal-actions')).toBeNull()
  })

  it('does not render title when not provided', () => {
    const { container } = render(
      <Modal open={true}>
        <p>Content</p>
      </Modal>
    )
    expect(container.querySelector('.modal-title')).toBeNull()
  })

  it('has aria-modal and role attributes', () => {
    render(
      <Modal open={true} title="Test">
        <p>Content</p>
      </Modal>
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })
})