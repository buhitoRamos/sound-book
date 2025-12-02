import React from 'react'
import './Modal.css'

export default function Modal({ open, title, children, onConfirm, onCancel, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar' }) {
  if (!open) return null
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        {title && <h3 className="modal-title">{title}</h3>}
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          <button className="btn secondary" onClick={onCancel}>{cancelLabel}</button>
          <button className="btn danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
