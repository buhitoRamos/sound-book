import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'
import Spinner from '../Spinner/Spinner'
import { initGoogleCalendar, createCalendarEvent } from '../../lib/googleCalendar'

export default function JobsForm({ initial = null, onSaved, onCancel, SpinnerComponent = Spinner, user }) {
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
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')

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
      setEventDate('')
      setEventTime('')
    }
  }, [initial])

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!user?.id) {
      toast.error('Error: usuario no identificado')
      return
    }
    
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
        const payload = { job, currency, work_status: workStatus, exp_currency: expCurrency, user_id: user.id }
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
        const { data: newJob, error } = await supabase.from('jobs').insert(payload).select().single()
        if (error) throw error

        // If there is an initial payment, create a record in payments table
        if (payload.payment_amount && payload.payment_amount > 0) {
          const { error: payError } = await supabase.from('payments').insert({
            job_id: newJob.id,
            amount: payload.payment_amount,
            currency: payload.payment_currency,
            detail: 'Pago inicial',
            created_at: new Date().toISOString(),
            user_id: user.id
          })
          if (payError) {
            console.error('Error creating initial payment record', payError)
            toast.error('Trabajo creado pero no se pudo registrar el pago inicial')
          }
        }

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

  async function handleAddToCalendar() {
    if (!eventDate || !eventTime) {
      toast.error('Por favor ingresa fecha y hora del evento')
      return
    }

    setLoading(true)
    try {
      await initGoogleCalendar()

      const startDateTime = new Date(`${eventDate}T${eventTime}:00`)
      const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000) // +2 hours

      await createCalendarEvent({
        summary: job || 'Trabajo de audio',
        description: `Monto: ${currency.toUpperCase()} ${amount}\nEstado: ${workStatus}`,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        location: ''
      })

      toast.success('Evento agregado al calendario')
    } catch (err) {
      console.error(err)
      toast.error('Error al agregar evento al calendario')
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

      <div>
        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Monto Total</label>
        <div className="money-row">
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="ars">$</option>
            <option value="usd">u$s</option>
            <option value="eur">€</option>
          </select>
          <input placeholder="Monto" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Pago Inicial / A cuenta</label>
        <div className="money-row">
          <select value={paymentCurrency} onChange={(e) => setPaymentCurrency(e.target.value)}>
            <option value="ars">$</option>
            <option value="usd">u$s</option>
            <option value="eur">€</option>
          </select>
          <input placeholder="Pago" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Estado</label>
        <select value={workStatus} onChange={(e) => setWorkStatus(e.target.value)}>
          <option value="in_progress">En progreso</option>
          <option value="finish">Finalizado</option>
          <option value="cancel">Cancelado</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Gastos</label>
        <div className="money-row">
          <select value={expCurrency} onChange={(e) => setExpCurrency(e.target.value)}>
            <option value="ars">$</option>
            <option value="usd">u$s</option>
            <option value="eur">€</option>
          </select>
          <input placeholder="Gastos" value={expenses} onChange={(e) => setExpenses(e.target.value)} />
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 16, marginTop: 16 }}>
        <label style={{ display: 'block', fontSize: 12, marginBottom: 8, fontWeight: 600, color: '#1e293b' }}>📅 Agregar al Google Calendar</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 11, marginBottom: 4, color: '#64748b' }}>Fecha</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.1)',
                fontSize: '14px',
                background: 'white',
                color: '#1e293b',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 11, marginBottom: 4, color: '#64748b' }}>Hora</label>
            <input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.1)',
                fontSize: '14px',
                background: 'white',
                color: '#1e293b',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            />
          </div>
        </div>
        <button
          type="button"
          className="btn secondary"
          onClick={handleAddToCalendar}
          disabled={loading || !eventDate || !eventTime}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '14px',
            fontWeight: 600,
            background: !eventDate || !eventTime ? '#e2e8f0' : '#10b981',
            color: !eventDate || !eventTime ? '#94a3b8' : 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: !eventDate || !eventTime ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (eventDate && eventTime && !loading) {
              e.target.style.background = '#059669'
            }
          }}
          onMouseLeave={(e) => {
            if (eventDate && eventTime && !loading) {
              e.target.style.background = '#10b981'
            }
          }}
        >
          📅 Agregar Evento a Google Calendar
        </button>
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
