import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Spinner from '../Spinner/Spinner'
import { toast } from 'react-hot-toast'
import Modal from '../Modal/Modal'
import PaymentForm from './PaymentForm'
import './Payments.css'

export default function Payments({ user }) {
  const [bands, setBands] = useState([])
  const [jobs, setJobs] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)

  const [selectedBand, setSelectedBand] = useState('')
  const [selectedJob, setSelectedJob] = useState('')

  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => { loadBands(); loadJobs(); loadPayments() }, [])

  async function loadBands() {
    const { data, error } = await supabase.from('bands').select('id, name')
    if (!error) setBands(data || [])
  }

  async function loadJobs() {
    const { data, error } = await supabase.from('jobs').select('id, job, band_id, amount, currency, work_status, payment_amount, bands(name)').eq('user_id', user?.id)
    if (!error) setJobs(data || [])
  }

  async function loadPayments() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('payments').select('id, created_at, job_id, amount, currency, detail').eq('user_id', user?.id)
      if (error) throw error
      setPayments(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function paymentsForSelected() {
    return payments.filter(p => {
      if (selectedBand && selectedJob) return String(p.job_id) === String(selectedJob)
      if (selectedBand) {
        // find jobs for band
        const jobIds = jobs.filter(j => String(j.band_id) === String(selectedBand)).map(j => j.id)
        return jobIds.includes(p.job_id)
      }
      return true
    })
  }

  function normalizeCurrency(c) {
    if (!c) return ''
    return c.toString().toLowerCase()
  }

  function debtForJob(jobId) {
    const job = jobs.find(j => j.id === jobId)
    if (!job) return null
    const jobAmount = job.amount === null || job.amount === undefined || job.amount === '' ? null : Number(job.amount)
    if (jobAmount === null || Number.isNaN(jobAmount)) return null
    const jobCurr = normalizeCurrency(job.currency)
    const sumPayments = payments.reduce((acc, p) => {
      if (String(p.job_id) !== String(jobId)) return acc
      const payCurr = normalizeCurrency(p.currency)
      if (payCurr !== jobCurr) return acc
      const a = p.amount === null || p.amount === undefined || p.amount === '' ? 0 : Number(p.amount)
      return acc + (Number.isNaN(a) ? 0 : a)
    }, 0)
    return jobAmount - sumPayments
  }

  function formatAmount(amount, currency) {
    if (amount === null || amount === undefined || amount === '') return ''
    const n = Number(amount)
    if (Number.isNaN(n)) return String(amount)
    const formatted = n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    const sym = (currency === 'ars' || currency === 'ar') ? '$' : currency === 'usd' ? 'u$s' : currency === 'eur' ? '€' : ''
    return `${sym} ${formatted}`.trim()
  }

  function getCurrencySymbol(currency) {
    if (!currency) return ''
    if (currency === 'ars' || currency === 'ar') return '$'
    if (currency === 'usd') return 'u$s'
    if (currency === 'eur') return '€'
    return currency
  }

  const [searchText, setSearchText] = useState('')

  return (
    <div className="payments-root">
      <div className="payments-controls">
        <select value={selectedBand} onChange={e => { setSelectedBand(e.target.value); setSelectedJob('') }}>
          <option value="">Todas las bandas</option>
          {bands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {loading ? <div className="payments-loading"><Spinner message="Cargando pagos..." /></div> : (
        <>
          <table className="payments-table">
            <thead><tr><th>Fecha</th><th>Job</th><th>Monto</th><th>Moneda</th><th>Deuda</th><th>Detalle</th><th></th></tr></thead>
            <tbody>
              {paymentsForSelected().map(p => (
                <tr key={p.id}>
                  <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td>{jobs.find(j => j.id === p.job_id)?.job || p.job_id}</td>
                  <td>{formatAmount(p.amount, p.currency) || '-'}</td>
                  <td>{(p.currency || '').toString().toUpperCase()}</td>
                  <td>{(() => {
                    const d = debtForJob(p.job_id)
                    const job = jobs.find(j => j.id === p.job_id)
                    return d === null ? '-' : formatAmount(d, job?.currency)
                  })()}</td>
                  <td>{p.detail}</td>
                  <td><button className="btn" onClick={() => { setEditing(p); setModalOpen(true) }}>Editar</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="payments-cards">
            {paymentsForSelected().map(p => (
              <div className="payment-card" key={p.id}>
                <div className="pc-header">
                  <div className="pc-date">{new Date(p.created_at).toLocaleDateString()}</div>
                  <div className="pc-amount">{formatAmount(p.amount, p.currency) || `${getCurrencySymbol(p.currency)} -`}</div>
                </div>
                <div className="pc-job">{jobs.find(j => j.id === p.job_id)?.job || p.job_id}</div>
                <div className="pc-detail">{p.detail}</div>
                <div className="pc-debt">Deuda: {(() => {
                  const d = debtForJob(p.job_id)
                  const job = jobs.find(j => j.id === p.job_id)
                  return d === null ? '-' : formatAmount(d, job?.currency)
                })()}</div>
                <div className="pc-actions"><button className="btn" onClick={() => { setEditing(p); setModalOpen(true) }}>Editar</button></div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal open={modalOpen} title={editing && editing.id ? 'Editar pago' : 'Nuevo pago'} showFooter={false} onCancel={() => { setModalOpen(false); setEditing(null) }} onConfirm={null}>
        {modalOpen && (
          <PaymentForm initial={editing} jobs={jobs.filter(j => !selectedBand || String(j.band_id) === String(selectedBand))} onSaved={() => { setModalOpen(false); setEditing(null); loadPayments(); loadJobs(); }} onCancel={() => { setModalOpen(false); setEditing(null) }} user={user} />
        )}
      </Modal>
    </div>
  )
}

