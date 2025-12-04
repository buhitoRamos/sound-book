import React from 'react'
import './Modal.css'

export default function Modal({ open, title, children, onConfirm, onCancel, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', showFooter = true }) {
  if (!open) return null
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        {title && <h3 className="modal-title">{title}</h3>}
        <div className="modal-body">{children}</div>
        {showFooter && (
          <div className="modal-actions">
            <button className="btn secondary" onClick={onCancel}>{cancelLabel}</button>
            <button className="btn danger" onClick={onConfirm}>{confirmLabel}</button>
          </div>
        )}
      </div>
    </div>
  )
}
