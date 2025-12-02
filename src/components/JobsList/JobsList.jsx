import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'
import Spinner from '../Spinner/Spinner'
import Modal from '../Modal/Modal'
import JobsForm from './JobsForm'
import './JobsList.css'

export default function JobsList({ user }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)

  const loadJobs = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('jobs').select('id, created_at, band_id, job, amount, currency, work_status, expenses, exp_currency, payment_currency, payment_amount, bands(name)').order('created_at', { ascending: false })
      if (error) throw error
      setJobs(data || [])
    } catch (err) {
      console.error('Error loading jobs', err)
      toast.error('No fue posible cargar los trabajos')
    } finally {
      setLoading(false)
    }
  }, [])

  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  useEffect(() => { loadJobs() }, [loadJobs])

  function formatAmount(value, currency) {
    if (value === null || value === undefined || value === '') return '—'
    const v = value
    if (!currency) return `${v}`
    const c = String(currency).toLowerCase()
    if (c === 'usd') return `u$s ${v}`
    if (c === 'ar' || c === 'ars' || c === 'ars$') return `$ ${v}`
    if (c === 'eur' || c === 'euro') return `€ ${v}`
    return `${c.toUpperCase()} ${v}`
  }

  function mapStatus(status) {
    if (!status) return ''
    const s = String(status).toLowerCase()
    if (s === 'in_progress' || s === 'in-progress' || s === 'in progress') return 'En progreso'
    if (s === 'finish' || s === 'finished' || s === 'finalizado') return 'Finalizado'
    if (s === 'cancel' || s === 'cancelado') return 'Cancelado'
    return status
  }

  return (
    <div className="jobs-root">
      <div className="jobs-header">
        <h3>Trabajos</h3>
        <div className="jobs-count">{jobs.length}</div>
      </div>

      {editing ? (
        <div className="jobs-editing">
          <h3>Editar trabajo</h3>
          <JobsForm SpinnerComponent={Spinner} initial={editing} onSaved={() => { setEditing(null); loadJobs() }} onCancel={() => setEditing(null)} />
        </div>
      ) : (
        <> 
          {loading ? (
            <div className="jobs-loading"><Spinner message="Cargando trabajos…" /></div>
          ) : jobs.length === 0 ? (
            <div className="jobs-empty">No hay trabajos</div>
          ) : (
            <ul className="jobs-list">
              {jobs.map((j) => (
                <li key={j.id} className="job-row">
                  <div className="job-main">
                    <div className="job-title">{j.job} <span className="job-status">{mapStatus(j.work_status)}</span></div>
                    <div className="job-meta">{j.bands?.name || `Band ID: ${j.band_id}`} · {j.created_at ? new Date(j.created_at).toLocaleDateString('es-ES') : '—'}</div>
                  </div>
                  <div className="job-right">
                    <div className="job-amount">{formatAmount(j.amount, j.currency)}</div>
                    <div className="job-payment">Pago: {formatAmount(j.payment_amount, j.payment_currency)}</div>
                    <div className="job-exp">Gastos: {formatAmount(j.expenses, j.exp_currency)}</div>
                    {/* deuda: si amount > payment_amount mostrar en rojo */}
                    {(() => {
                      const amt = Number(j.amount) || 0
                      const pay = Number(j.payment_amount) || 0
                      if (amt > pay) {
                        const diff = amt - pay
                        // si monedas coinciden use la moneda del trabajo, sino mostrar aviso
                        const debtLabel = formatAmount(diff, j.currency)
                        return <div className="job-debt">Deuda: {debtLabel}</div>
                      }
                      return null
                    })()}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button className="btn" onClick={() => setEditing(j)}>Editar</button>
                      <button className="btn danger" onClick={() => { setToDelete(j); setModalOpen(true) }}>Borrar</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Modal open={modalOpen} title="Confirmar borrado" onCancel={() => { setModalOpen(false); setToDelete(null) }} onConfirm={async () => {
            if (!toDelete) return
            try {
              const { error } = await supabase.from('jobs').delete().eq('id', toDelete.id)
              if (error) throw error
              toast.success('Trabajo eliminado')
              setModalOpen(false)
              setToDelete(null)
              loadJobs()
            } catch (err) {
              console.error(err)
              toast.error('No fue posible eliminar el trabajo')
            }
          }} confirmLabel="Eliminar">
            <p>¿Deseas eliminar el trabajo <strong>{toDelete?.job}</strong> para la banda <strong>{toDelete?.bands?.name || toDelete?.band_id}</strong>?</p>
          </Modal>
        </>
      )}
    </div>
  )
}
