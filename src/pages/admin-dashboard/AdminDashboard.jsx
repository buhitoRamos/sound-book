import React, { useState, useEffect } from 'react'
import StatusBar from '../../components/StatusBar/StatusBar'
import AdminPayments from '../../components/AdminPayments/AdminPayments'
import Spinner from '../../components/Spinner/Spinner'
import ChangePassword from '../../components/ChangePassword/ChangePassword'
import './AdminDashboard.css'

export default function AdminDashboard({ user, onLogout }) {
  const [view, setView] = useState('payments')
  const [history, setHistory] = useState(['payments'])

  useEffect(() => {
    // Handle browser/mobile back button
    function handlePopState(event) {
      if (history.length > 1) {
        const newHistory = [...history]
        newHistory.pop() // Remove current view
        const previousView = newHistory[newHistory.length - 1] || 'payments'
        setHistory(newHistory)
        setView(previousView)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [history])

  function handleMenuSelect(key) {
    if (key === 'payments') setView('payments')
    if (key === 'profile') setView('change-password')
    if (key === 'help') setView('help')
    
    // Add to history and push state
    setHistory(prev => [...prev, key])
    window.history.pushState({ view: key }, '', '')
  }

  return (
    <div>
      <StatusBar title="Panel Administrativo" onLogout={onLogout} onMenuSelect={handleMenuSelect} adminOnlyMenu={true} />
      <main className="admin-dashboard-main">
        {view === 'payments' && (
          <>
            <h1>Gestión de Pagos Mensuales</h1>
            <p>Administrador: {user?.user}</p>
            <AdminPayments user={user} SpinnerComponent={Spinner} />
          </>
        )}

        {view === 'change-password' && (
          <ChangePassword SpinnerComponent={Spinner} user={user} onDone={() => setView('payments')} onLogout={onLogout} />
        )}

        {view === 'help' && (
          <div>
            <h2>Ayuda</h2>
            <p>En esta sección puedes gestionar los pagos mensuales de tus usuarios.</p>
            <p>Selecciona un usuario y registra el pago realizado.</p>
          </div>
        )}
      </main>
    </div>
  )
}
