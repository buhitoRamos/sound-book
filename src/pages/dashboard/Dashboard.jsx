import React, { useState, useEffect } from 'react'
import StatusBar from '../../components/StatusBar/StatusBar'
import ChangePassword from '../../components/ChangePassword/ChangePassword'
import ClientsList from '../../components/ClientsList/ClientsList'
import Spinner from '../../components/Spinner/Spinner'
import JobsList from '../../components/JobsList/JobsList'
import Payments from '../../components/Payments/Payments'
import Earnings from '../../components/Earnings/Earnings'
import Help from '../../components/Help/Help'
import './Dashboard.css'

export default function Dashboard({ user, onLogout }) {
  const [view, setView] = useState('artists')
  const [history, setHistory] = useState(['artists'])

  useEffect(() => {
    // Handle browser/mobile back button
    function handlePopState(event) {
      if (history.length > 1) {
        const newHistory = [...history]
        newHistory.pop() // Remove current view
        const previousView = newHistory[newHistory.length - 1] || 'artists'
        setHistory(newHistory)
        setView(previousView)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [history])

  function handleMenuSelect(key) {
    if (key === 'artists') setView('artists')
    if (key === 'profile') setView('change-password')
    if (key === 'settings') setView('settings')
    if (key === 'jobs') setView('jobs')
    if (key === 'payments') setView('payments')
    if (key === 'earnings') setView('earnings')
    if (key === 'help') setView('help')
    
    // Add to history and push state
    setHistory(prev => [...prev, key])
    window.history.pushState({ view: key }, '', '')
  }

  return (
    <div>
      <StatusBar title="Dashboard" onLogout={onLogout} onMenuSelect={handleMenuSelect} />
      <main className="dashboard-main">
        {view === 'artists' && (
          <>
            <h1>Artistas / Bandas</h1>
            <p>Usuario: {user?.user}</p>
            <ClientsList SpinnerComponent={Spinner} user={user} onSelect={(c) => console.log('selected', c)} />
          </>
        )}

        {view === 'change-password' && (
          <ChangePassword SpinnerComponent={Spinner} user={user} onDone={() => setView('artists')} onLogout={onLogout} />
        )}

        {view === 'jobs' && (
          <>
            <JobsList user={user} />
          </>
        )}
        {view === 'settings' && (
          <div>
            <h2>Ajustes</h2>
            <p>Próximamente</p>
          </div>
        )}
        {view === 'payments' && (
          <>
            <Payments user={user} />
          </>
        )}
        {view === 'earnings' && (
          <>
            <Earnings user={user} />
          </>
        )}
        {view === 'help' && (
          <>
            <Help />
          </>
        )}
      </main>
    </div>
  )
}
