import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'
import './AdminPayments.css'

export default function AdminPayments({ user }) {
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [amount, setAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(() => {
    // default to today's date at 00:00 local time for datetime-local input
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    const off = d.getTimezoneOffset()
    const local = new Date(d.getTime() - off * 60 * 1000)
    return local.toISOString().slice(0, 16)
  })
  const [payments, setPayments] = useState([])
  const [allPayments, setAllPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('register')

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, user, role')
          .neq('role', 'admin')
          .order('user', { ascending: true })

        if (error) {
          console.error('Error fetching users:', error)
          toast.error('Error al cargar usuarios')
          return
        }
        setUsers(data || [])
      } catch (err) {
        console.error(err)
        toast.error('Error inesperado')
      }
    }
    fetchUsers()
  }, [])

  // Cargar todos los pagos al abrir el tab de historial
  useEffect(() => {
    async function fetchAllPayments() {
      if (viewMode !== 'view') {
        return
      }
      try {
        let query = supabase
          .from('admin_payments')
          .select('*')
          .order('created_at', { ascending: false })

        if (selectedUserId) {
          query = query.eq('user_id', selectedUserId)
        }

        const { data, error } = await query

        if (error) {
          console.error('Error fetching all payments:', error)
          return
        }
        setAllPayments(data || [])
      } catch (err) {
        console.error(err)
      }
    }
    fetchAllPayments()
  }, [selectedUserId, viewMode])

  useEffect(() => {
    async function fetchPayments() {
      if (!selectedUserId || viewMode !== 'register') {
        setPayments([])
        return
      }
      try {
        const startDate = new Date(selectedYear, selectedMonth - 1, 1)
        const endDate = new Date(selectedYear, selectedMonth, 1)

        const { data, error } = await supabase
          .from('admin_payments')
          .select('*')
          .eq('user_id', selectedUserId)
          .gte('created_at', startDate.toISOString())
          .lt('created_at', endDate.toISOString())
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching payments:', error)
          return
        }
        setPayments(data || [])
      } catch (err) {
        console.error(err)
      }
    }
    fetchPayments()
  }, [selectedUserId, selectedYear, selectedMonth, viewMode])

  async function handleRegisterPayment(e) {
    e.preventDefault()

    if (!selectedUserId) {
      toast.error('Selecciona un usuario')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Ingresa un monto válido')
      return
    }

    setLoading(true)

    try {
      const createdAtIso = new Date(paymentDate).toISOString()
      const { error } = await supabase
        .from('admin_payments')
        .insert([
          {
            user_id: selectedUserId,
            amount: parseFloat(amount),
            created_at: createdAtIso
          }
        ])

      if (error) {
        console.error('Error registering payment:', error)
        toast.error('Error al registrar pago')
        setLoading(false)
        return
      }

      toast.success('Pago registrado correctamente')
      setAmount('')
      
      // Refresh payments for the month of the paymentDate
      const d = new Date(paymentDate)
      const startDate = new Date(d.getFullYear(), d.getMonth(), 1)
      const endDate = new Date(d.getFullYear(), d.getMonth() + 1, 1)
      const { data } = await supabase
        .from('admin_payments')
        .select('*')
        .eq('user_id', selectedUserId)
        .gte('created_at', startDate.toISOString())
        .lt('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })

      setPayments(data || [])
    } catch (err) {
      console.error(err)
      toast.error('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  function getMonthName(month) {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return months[month - 1]
  }

  function groupPaymentsByMonth(paymentsArray) {
    const grouped = {}
    
    paymentsArray.forEach(payment => {
      const date = new Date(payment.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = []
      }
      grouped[monthKey].push(payment)
    })

    return Object.entries(grouped)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([monthKey, monthPayments]) => ({
        monthKey,
        payments: monthPayments,
        total: monthPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
      }))
  }

  const selectedUser = users.find(u => String(u.id) === String(selectedUserId))
  const totalPayments = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
  const totalAllPayments = allPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
  const groupedPayments = groupPaymentsByMonth(allPayments)

  return (
    <div className="admin-payments">
      <div className="payments-tabs">
        <button
          className={`tab-button ${viewMode === 'register' ? 'active' : ''}`}
          onClick={() => setViewMode('register')}
        >
          Registrar Pago
        </button>
        <button
          className={`tab-button ${viewMode === 'view' ? 'active' : ''}`}
          onClick={() => setViewMode('view')}
        >
          Ver Historial
        </button>
      </div>

      <div className="payments-container">
        {viewMode === 'view' && (
          <div className="view-payments">
            <h3>Historial Completo de Pagos</h3>
            <p className="period-info">
              {selectedUser ? `Filtrado por: ${selectedUser.user}` : 'Todos los usuarios'}
            </p>

            <div className="user-selection">
              <h4>Filtrar por usuario (opcional)</h4>
              <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value || null)}
                className="user-select"
              >
                <option value="">-- Mostrar todos --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.user}
                  </option>
                ))}
              </select>
            </div>

            {groupedPayments.length > 0 ? (
              <>
                <div className="payments-by-month">
                  {groupedPayments.map(({ monthKey, payments: monthPayments, total }) => {
                    const [year, month] = monthKey.split('-')
                    const monthNum = parseInt(month)
                    
                    return (
                      <div key={monthKey} className="month-section">
                        <div className="month-header">
                          <span className="month-title">
                            {getMonthName(monthNum)} {year}
                          </span>
                          <span className="month-total">
                            ${total.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="month-payments">
                          {monthPayments.map((payment) => {
                            const paymentUser = users.find(u => String(u.id) === String(payment.user_id))
                            return (
                              <div key={payment.id} className="payment-card">
                                <div className="payment-info">
                                  <div className="payment-date">
                                    {new Date(payment.created_at).toLocaleDateString('es-ES', {
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                  <div className="payment-user">
                                    {paymentUser?.user || 'Usuario desconocido'}
                                  </div>
                                  <div className="payment-description">
                                    {payment.description || 'Pago mensual'}
                                  </div>
                                </div>
                                <div className="payment-amount">
                                  ${parseFloat(payment.amount).toFixed(2)}
                                </div>
                                <div className={`payment-status ${payment.status}`}>
                                  {payment.status === 'completed' ? '✓' : 'P'}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                <div className="payments-grand-total">
                  <strong>Total {selectedUser ? `de ${selectedUser.user}` : 'histórico'}:</strong>
                  <span className="total-amount">${totalAllPayments.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="no-payments">
                No hay pagos registrados
              </div>
            )}
          </div>
        )}

        {viewMode === 'register' && (
          <>
            <div className="user-selection">
              <h3>Seleccionar Usuario</h3>
              <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value || null)}
                className="user-select"
              >
                <option value="">-- Elige un usuario --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.user}
                  </option>
                ))}
              </select>
            </div>

            {selectedUser && (
              <>
                <div className="period-selection">
                  <h3>Fecha del pago</h3>
                  <div className="period-inputs">
                    <div className="input-group">
                      <label>Fecha y hora</label>
                      <input
                        type="datetime-local"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="date-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="register-payment-form">
                  <h3>Registrar Pago para {selectedUser.user}</h3>
                  <p className="period-info">
                    {new Date(paymentDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>

                  <form onSubmit={handleRegisterPayment}>
                    <label>
                      Monto
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={loading}
                      />
                    </label>

                    <button
                      type="submit"
                      className="btn-register"
                      disabled={loading || !amount || !paymentDate}
                    >
                      {loading ? 'Registrando...' : 'Registrar Pago'}
                    </button>
                  </form>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
