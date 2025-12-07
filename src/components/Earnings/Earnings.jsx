import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Spinner from '../Spinner/Spinner'
import './Earnings.css'

export default function Earnings({ user }) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ monthly: {}, yearly: {} })
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear())

  useEffect(() => {
    if (user?.id) loadData()
  }, [user?.id])

  async function loadData() {
    setLoading(true)
    try {
      // Fetch payments for income
      const { data: payments, error: payErr } = await supabase
        .from('payments')
        .select('amount, currency, created_at')
        .eq('user_id', user?.id)
      
      if (payErr) throw payErr

      // Fetch jobs for expenses
      const { data: jobs, error: jobErr } = await supabase
        .from('jobs')
        .select('expenses, exp_currency, created_at')
        .eq('user_id', user?.id)
      
      if (jobErr) throw jobErr

      processStats(payments || [], jobs || [])
    } catch (err) {
      console.error('Error loading earnings data', err)
    } finally {
      setLoading(false)
    }
  }

  function normalizeCurrency(c) {
    if (!c) return 'ars'
    const s = String(c).toLowerCase().trim()
    if (s === 'ar' || s === 'ars' || s === '$') return 'ars'
    if (s === 'usd' || s === 'u$s' || s === 'us') return 'usd'
    if (s === 'eur' || s === 'euro' || s === '€') return 'eur'
    return 'ars'
  }

  function processStats(payments, jobs) {
    const monthly = {} // Key: "YYYY-MM" -> { ars: 0, usd: 0, eur: 0 }
    const yearly = {}  // Key: "YYYY" -> { ars: 0, usd: 0, eur: 0 }

    // Process Income (Payments)
    payments.forEach(p => {
      if (!p.amount || !p.created_at) return
      const date = new Date(p.created_at)
      const y = date.getFullYear()
      const m = date.getMonth() + 1
      const keyM = `${y}-${String(m).padStart(2, '0')}`
      const keyY = `${y}`
      const curr = normalizeCurrency(p.currency)
      const amt = Number(p.amount)

      if (!monthly[keyM]) monthly[keyM] = { ars: 0, usd: 0, eur: 0 }
      if (!yearly[keyY]) yearly[keyY] = { ars: 0, usd: 0, eur: 0 }

      monthly[keyM][curr] += amt
      yearly[keyY][curr] += amt
    })

    // Process Expenses (Jobs)
    jobs.forEach(j => {
      if (!j.expenses || !j.created_at) return
      const date = new Date(j.created_at)
      const y = date.getFullYear()
      const m = date.getMonth() + 1
      const keyM = `${y}-${String(m).padStart(2, '0')}`
      const keyY = `${y}`
      const curr = normalizeCurrency(j.exp_currency)
      const amt = Number(j.expenses)

      if (!monthly[keyM]) monthly[keyM] = { ars: 0, usd: 0, eur: 0 }
      if (!yearly[keyY]) yearly[keyY] = { ars: 0, usd: 0, eur: 0 }

      monthly[keyM][curr] -= amt
      yearly[keyY][curr] -= amt
    })

    setStats({ monthly, yearly })
  }

  function formatMoney(amount, currency) {
    const n = Number(amount)
    if (isNaN(n)) return '-'
    const sym = currency === 'ars' ? '$' : currency === 'usd' ? 'u$s' : '€'
    return `${sym} ${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  const years = Object.keys(stats.yearly).sort((a, b) => b - a)
  const monthsInYear = Object.keys(stats.monthly)
    .filter(k => k.startsWith(`${yearFilter}-`))
    .sort((a, b) => b.localeCompare(a))

  return (
    <div className="earnings-root">
      <div className="earnings-header">
        <h2>Ganancias</h2>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
          {years.length > 0 ? years.map(y => <option key={y} value={y}>{y}</option>) : <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>}
        </select>
      </div>

      {loading ? <Spinner message="Calculando ganancias..." /> : (
        <div className="earnings-content">
          <div className="earnings-summary">
            <h3>Total Anual {yearFilter}</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Pesos (ARS)</div>
                <div className={`stat-value ${stats.yearly[yearFilter]?.ars < 0 ? 'negative' : (stats.yearly[yearFilter]?.ars > 0 ? 'positive' : '')}`}>
                  {formatMoney(stats.yearly[yearFilter]?.ars || 0, 'ars')}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Dólares (USD)</div>
                <div className={`stat-value ${stats.yearly[yearFilter]?.usd < 0 ? 'negative' : (stats.yearly[yearFilter]?.usd > 0 ? 'positive' : '')}`}>
                  {formatMoney(stats.yearly[yearFilter]?.usd || 0, 'usd')}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Euros (EUR)</div>
                <div className={`stat-value ${stats.yearly[yearFilter]?.eur < 0 ? 'negative' : (stats.yearly[yearFilter]?.eur > 0 ? 'positive' : '')}`}>
                  {formatMoney(stats.yearly[yearFilter]?.eur || 0, 'eur')}
                </div>
              </div>
            </div>
          </div>

          <div className="earnings-monthly">
            <h3>Desglose Mensual</h3>
            <table className="earnings-table">
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>ARS</th>
                  <th>USD</th>
                  <th>EUR</th>
                </tr>
              </thead>
              <tbody>
                {monthsInYear.map(m => {
                  const [y, monthNum] = m.split('-')
                  const date = new Date(y, monthNum - 1, 1)
                  const monthName = date.toLocaleString('es-ES', { month: 'long' })
                  const s = stats.monthly[m]
                  return (
                    <tr key={m}>
                      <td style={{ textTransform: 'capitalize' }}>{monthName}</td>
                      <td className={s.ars < 0 ? 'negative' : (s.ars > 0 ? 'positive' : '')}>{formatMoney(s.ars, 'ars')}</td>
                      <td className={s.usd < 0 ? 'negative' : (s.usd > 0 ? 'positive' : '')}>{formatMoney(s.usd, 'usd')}</td>
                      <td className={s.eur < 0 ? 'negative' : (s.eur > 0 ? 'positive' : '')}>{formatMoney(s.eur, 'eur')}</td>
                    </tr>
                  )
                })}
                {monthsInYear.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20, color: 'var(--muted)' }}>No hay datos para este año</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
