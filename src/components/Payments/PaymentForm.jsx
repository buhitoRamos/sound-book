import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'

export default function PaymentForm({ initial = null, jobs = [], onSaved, onCancel, user }) {
  const [jobId, setJobId] = useState(initial?.job_id || '')
  const [amount, setAmount] = useState(initial?.amount ?? '')
  const [currency, setCurrency] = useState(initial?.currency || 'ars')
  const [detail, setDetail] = useState(initial?.detail || '')
  const [jobText, setJobText] = useState('')
  const [initialJobText, setInitialJobText] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentDate, setPaymentDate] = useState(initial?.created_at ? new Date(initial.created_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10))

  const isEditing = Boolean(initial && initial.id)
  const selectedJob = jobs.find(j => String(j.id) === String(jobId))

  useEffect(() => {
    setJobId(initial?.job_id || '')
    setAmount(initial?.amount ?? '')
    setCurrency(initial?.currency || 'ars')
    setDetail(initial?.detail || '')
    setPaymentDate(initial?.created_at ? new Date(initial.created_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10))
    // preload job text when editing
    const jobObj = jobs.find(j => j.id === initial?.job_id)
    const jt = jobObj?.job || ''
    setJobText(jt)
    setInitialJobText(jt)
  }, [initial, jobs])

  function formatMoney(val, curr) {
    if (val === null || val === undefined) return '-'
    const n = Number(val)
    if (Number.isNaN(n)) return '-'
    const sym = (curr === 'ars' || curr === 'ar') ? '$' : curr === 'usd' ? 'u$s' : curr === 'eur' ? '€' : ''
    return `${sym} ${n.toLocaleString()}`
  }

  function mapStatus(status) {
    if (!status) return ''
    const s = String(status).toLowerCase()
    if (s === 'in_progress' || s === 'in-progress' || s === 'in progress') return 'En progreso'
    if (s === 'finish' || s === 'finished' || s === 'finalizado') return 'Finalizado'
    if (s === 'cancel' || s === 'cancelado') return 'Cancelado'
    return status
  }

  async function save() {
    if (!user?.id) {
      toast.error('Error: usuario no identificado')
      return
    }
    
    setLoading(true)
    try {
      const payload = { 
        job_id: jobId || null, 
        amount: amount === '' ? null : parseInt(Number(amount), 10), 
        currency, 
        detail,
        created_at: paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString(),
        user_id: user.id
      }
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
            // 1. Revert old amount from old job
            if (oldJobId) {
              const { data: oldJob, error: oErr } = await supabase.from('jobs').select('payment_amount').eq('id', oldJobId).single()
              if (!oErr) {
                const cur = oldJob?.payment_amount ?? 0
                await supabase.from('jobs').update({ payment_amount: Number(cur) - Number(oldAmt) }).eq('id', oldJobId)
              }
            }
            // 2. Apply new amount to new job
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
        toast.success('Pago actualizado')
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
        } else {
          toast.success('Pago creado')
        }
      }
      onSaved && onSaved()
    } catch (err) {
      console.error(err)
      toast.error('Error al guardar pago')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="payment-form">
      {selectedJob && (
        <div style={{ marginBottom: 16, padding: 12, background: 'rgba(0,0,0,0.03)', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ fontWeight: 600 }}>{selectedJob.bands?.name || `Band ${selectedJob.band_id}`}</div>
            <div style={{ fontSize: '0.9em', opacity: 0.7 }}>{mapStatus(selectedJob.work_status)}</div>
          </div>
          <div style={{ marginBottom: 4 }}>{selectedJob.job}</div>
          <div style={{ fontSize: '0.9em', color: 'var(--muted)' }}>
            Deuda actual: {formatMoney((Number(selectedJob.amount || 0) - Number(selectedJob.payment_amount || 0)), selectedJob.currency)}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 8 }}>
        <label>
          <div style={{ marginBottom: 6, color: 'var(--muted)' }}>Fecha del pago</div>
          <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)' }} />
        </label>
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
