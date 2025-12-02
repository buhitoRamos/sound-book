import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Spinner from '../Spinner/Spinner'
import { toast } from 'react-hot-toast'
import Modal from '../Modal/Modal'
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
    const { data, error } = await supabase.from('jobs').select('id, job, band_id, amount, currency')
    if (!error) setJobs(data || [])
  }

  async function loadPayments() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('payments').select('id, created_at, job_id, amount, currency, detail')
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

  return (
    <div className="payments-root">
      <div className="payments-controls">
        <select value={selectedBand} onChange={e => { setSelectedBand(e.target.value); setSelectedJob('') }}>
          <option value="">Todas las bandas</option>
          {bands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>

        <select value={selectedJob} onChange={e => setSelectedJob(e.target.value)}>
          <option value="">Todos los trabajos</option>
          {jobs.filter(j => !selectedBand || String(j.band_id) === String(selectedBand)).map(j => <option key={j.id} value={j.id}>{j.job}</option>)}
        </select>

        <button className="btn" onClick={() => { setEditing({}); setModalOpen(true) }}>Nuevo pago</button>
      </div>

      {loading ? <div className="payments-loading"><Spinner message="Cargando pagos..." /></div> : (
        <>
          <table className="payments-table">
            <thead><tr><th>Fecha</th><th>Job</th><th>Monto</th><th>Moneda</th><th>Deuda</th><th>Detalle</th><th></th></tr></thead>
            <tbody>
              {paymentsForSelected().map(p => (
                <tr key={p.id}>
                  <td>{new Date(p.created_at).toLocaleString()}</td>
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

      <Modal open={modalOpen} title={editing && editing.id ? 'Editar pago' : 'Nuevo pago'} onCancel={() => { setModalOpen(false); setEditing(null) }} onConfirm={null}>
        {modalOpen && (
          <PaymentForm initial={editing} jobs={jobs.filter(j => !selectedBand || String(j.band_id) === String(selectedBand))} onSaved={() => { setModalOpen(false); setEditing(null); loadPayments(); loadJobs(); }} onCancel={() => { setModalOpen(false); setEditing(null) }} />
        )}
      </Modal>
    </div>
  )
}

function PaymentForm({ initial = null, jobs = [], onSaved, onCancel }) {
  const [jobId, setJobId] = useState(initial?.job_id || '')
  const [amount, setAmount] = useState(initial?.amount ?? '')
  const [currency, setCurrency] = useState(initial?.currency || 'ars')
  const [detail, setDetail] = useState(initial?.detail || '')
  const [jobText, setJobText] = useState('')
  const [initialJobText, setInitialJobText] = useState('')
  const [loading, setLoading] = useState(false)

  const isEditing = Boolean(initial && initial.id)

  useEffect(() => {
    setJobId(initial?.job_id || '')
    setAmount(initial?.amount ?? '')
    setCurrency(initial?.currency || 'ars')
    setDetail(initial?.detail || '')
    // preload job text when editing
    const jobObj = jobs.find(j => j.id === initial?.job_id)
    const jt = jobObj?.job || ''
    setJobText(jt)
    setInitialJobText(jt)
  }, [initial])

  async function save() {
    setLoading(true)
    try {
      const payload = { job_id: jobId || null, amount: amount === '' ? null : parseInt(Number(amount), 10), currency, detail }
      if (initial && initial.id) {
        const { data: before, error: beforeErr } = await supabase.from('payments').select('id, job_id, amount, currency').eq('id', initial.id).single()
        if (beforeErr) console.error('Failed to read payment before update', beforeErr)
        const { error } = await supabase.from('payments').update(payload).eq('id', initial.id)
        if (error) throw error
        // adjust job payment_amounts if job_id or amount changed
        try {
          const oldAmt = before?.amount ?? 0
          const newAmt = payload.amount === null ? 0 : Number(payload.amount)
          const oldJobId = before?.job_id
          const newJobId = jobId || null
          if (!Number.isNaN(newAmt)) {
            if (oldJobId && String(oldJobId) !== String(newJobId)) {
              // subtract from old job
              const { data: oldJob, error: oErr } = await supabase.from('jobs').select('payment_amount').eq('id', oldJobId).single()
              if (!oErr) {
                const cur = oldJob?.payment_amount ?? 0
                await supabase.from('jobs').update({ payment_amount: Number(cur) - Number(oldAmt) }).eq('id', oldJobId)
              }
            }
            if (newJobId) {
              const { data: newJob, error: nErr } = await supabase.from('jobs').select('payment_amount').eq('id', newJobId).single()
              if (!nErr) {
                const cur = newJob?.payment_amount ?? 0
                await supabase.from('jobs').update({ payment_amount: Number(cur) + Number(newAmt), payment_currency: currency }).eq('id', newJobId)
              }
            }
          }
          } catch (e) { console.error('Error adjusting job payment after update', e) }
        // if job text changed, update jobs table
        if (jobId && jobText !== initialJobText) {
          const { error: jerr } = await supabase.from('jobs').update({ job: jobText }).eq('id', jobId)
          if (jerr) console.error('Failed updating job text', jerr)
        }
      } else {
        const { data: insertData, error } = await supabase.from('payments').insert(payload).select().single()
        if (error) throw error
        // If created payment is linked to a job, increment that job's payment_amount and set currency
        const amountInt = payload.amount === null ? null : Number(payload.amount)
        if (jobId && amountInt !== null && !Number.isNaN(amountInt)) {
          try {
            const { data: jobRow, error: jobErr } = await supabase.from('jobs').select('payment_amount').eq('id', jobId).single()
            if (!jobErr) {
              const current = jobRow?.payment_amount ?? 0
              const newAmount = Number(current) + amountInt
              const { error: upErr } = await supabase.from('jobs').update({ payment_amount: newAmount, payment_currency: currency }).eq('id', jobId)
              if (upErr) {
                console.error('Failed updating job payment_amount', upErr)
                toast.error('Pago registrado, pero no se pudo actualizar el trabajo')
              } else {
                toast.success('Trabajo actualizado con pago')
              }
            } else {
              console.error('Failed reading job for payment increment', jobErr)
            }
          } catch (e) {
            console.error('Error updating job payment after insert', e)
            toast.error('Pago creado, error actualizando trabajo')
          }
        }
      }
      onSaved && onSaved()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="payment-form">
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexDirection: 'column' }}>
        {isEditing ? (
          <label>
            <div style={{ marginBottom: 6, color: 'var(--muted)' }}>Trabajo</div>
            <textarea value={jobText} onChange={e => setJobText(e.target.value)} rows={3} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)' }} />
          </label>
        ) : (
          <label>
            <div style={{ marginBottom: 6, color: 'var(--muted)' }}>Seleccionar trabajo</div>
            <select value={jobId} onChange={e => setJobId(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8 }}>
              <option value="">Seleccionar trabajo</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.job}</option>)}
            </select>
          </label>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <select value={currency} onChange={e => setCurrency(e.target.value)}>
          <option value="ars">$</option>
          <option value="usd">u$s</option>
          <option value="eur">€</option>
        </select>
        <input placeholder="Monto" value={amount} onChange={e => setAmount(e.target.value)} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>
          <div style={{ marginBottom: 6, color: 'var(--muted)' }}>Detalle del pago</div>
          <textarea rows={3} value={detail} onChange={e => setDetail(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)' }} />
        </label>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn secondary" onClick={() => onCancel && onCancel()}>Cancelar</button>
        <button className="btn" onClick={save} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </div>
  )
}
