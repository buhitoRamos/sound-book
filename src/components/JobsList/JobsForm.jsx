import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'
import Spinner from '../Spinner/Spinner'

export default function JobsForm({ initial = null, onSaved, onCancel, SpinnerComponent = Spinner }) {
  const [job, setJob] = useState('')
  const [bandId, setBandId] = useState(null)
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('ars')
  const [workStatus, setWorkStatus] = useState('in_progress')
  const [expenses, setExpenses] = useState('')
  const [expCurrency, setExpCurrency] = useState('ars')
  const [paymentCurrency, setPaymentCurrency] = useState('ars')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
      if (initial) {
      setJob(initial.job || '')
      setBandId(initial.band_id ?? initial.bandId ?? null)
      setAmount(initial.amount || '')
      setCurrency(initial.currency || 'ars')
      setWorkStatus(initial.work_status || 'in_progress')
      setExpenses(initial.expenses || '')
      setExpCurrency(initial.exp_currency || 'ars')
      setPaymentCurrency(initial.payment_currency || 'ars')
      setPaymentAmount(initial.payment_amount || '')
    } else {
      setJob('')
      setBandId(null)
      setAmount('')
      setCurrency('')
      setWorkStatus('in_progress')
      setExpenses('')
      setExpCurrency('')
      setPaymentCurrency('ars')
      setPaymentAmount('')
    }
  }, [initial])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (initial && initial.id) {
        const payload = { job, currency, work_status: workStatus, exp_currency: expCurrency }
        if (bandId) payload.band_id = bandId
        // sanitize numeric fields
        payload.amount = amount === '' ? null : isNaN(Number(amount)) ? amount : Number(amount)
        payload.expenses = expenses === '' ? null : isNaN(Number(expenses)) ? expenses : Number(expenses)
        // include the payment currency code
        payload.payment_currency = paymentCurrency || null
        // payment_amount must be an integer or null
        if (paymentAmount === '') {
          payload.payment_amount = null
        } else if (!isNaN(Number(paymentAmount))) {
          payload.payment_amount = parseInt(Number(paymentAmount), 10)
        } else {
          payload.payment_amount = null
        }
        const { error } = await supabase.from('jobs').update(payload).eq('id', initial.id)
        if (error) throw error
        toast.success('Trabajo actualizado')
      } else {
        const payload = { job, currency, work_status: workStatus, exp_currency: expCurrency }
        if (bandId) payload.band_id = bandId
        payload.amount = amount === '' ? null : isNaN(Number(amount)) ? amount : Number(amount)
        payload.expenses = expenses === '' ? null : isNaN(Number(expenses)) ? expenses : Number(expenses)
        payload.payment_currency = paymentCurrency || null
        // payment_amount must be an integer or null
        if (paymentAmount === '') {
          payload.payment_amount = null
        } else if (!isNaN(Number(paymentAmount))) {
          payload.payment_amount = parseInt(Number(paymentAmount), 10)
        } else {
          payload.payment_amount = null
        }
        const { error } = await supabase.from('jobs').insert(payload)
        if (error) throw error
        toast.success('Trabajo creado')
      }
      onSaved && onSaved()
    } catch (err) {
      console.error(err)
      toast.error('Error guardando trabajo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="jobs-form" style={{ display: initial ? 'block' : 'none' }}>
      <div className="job-textarea-wrapper">
        <div className="job-textarea-inner">
          <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Trabajo</label>
          <textarea placeholder="Descripción del trabajo (ej. masterización, edición, mezcla)" value={job} onChange={(e) => setJob(e.target.value)} rows={4} />
        </div>
      </div>

      <div className="money-row">
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="ars">$</option>
          <option value="usd">u$s</option>
          <option value="eur">€</option>
        </select>
        <input placeholder="Monto" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>

      <div className="money-row">
        <select value={paymentCurrency} onChange={(e) => setPaymentCurrency(e.target.value)}>
          <option value="ars">$</option>
          <option value="usd">u$s</option>
          <option value="eur">€</option>
        </select>
        <input placeholder="Pago" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Estado</label>
        <select value={workStatus} onChange={(e) => setWorkStatus(e.target.value)}>
          <option value="in_progress">En progreso</option>
          <option value="finish">Finalizado</option>
          <option value="cancel">Cancelado</option>
        </select>
      </div>

      <div className="money-row">
        <select value={expCurrency} onChange={(e) => setExpCurrency(e.target.value)}>
          <option value="ars">$</option>
          <option value="usd">u$s</option>
          <option value="eur">€</option>
        </select>
        <input placeholder="Gastos" value={expenses} onChange={(e) => setExpenses(e.target.value)} />
      </div>
      {loading ? (
        <div style={{ marginTop: 8 }}><SpinnerComponent message="Guardando..." /></div>
      ) : (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="btn" type="submit">Guardar</button>
          <button type="button" className="btn secondary" onClick={() => onCancel && onCancel()}>Cancelar</button>
        </div>
      )}
    </form>
  )
}
