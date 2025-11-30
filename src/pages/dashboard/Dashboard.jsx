import React, { useState } from 'react'
import StatusBar from '../../components/StatusBar/StatusBar'
import ChangePassword from '../../components/ChangePassword/ChangePassword'

export default function Dashboard({ user, onLogout }) {
  const [view, setView] = useState('home')

  function handleMenuSelect(key) {
    if (key === 'profile') setView('change-password')
    if (key === 'settings') setView('settings')
  }

  return (
    <div>
      <StatusBar title="Dashboard" onLogout={onLogout} onMenuSelect={handleMenuSelect} />
      <main style={{ padding: 20, paddingTop: 'calc(8px + var(--statusbar-height))' }}>
        {view === 'home' && (
          <>
            <h1>Dashboard</h1>
            <p>Usuario: {user?.user}</p>
            <p>Rol: {user?.role}</p>
            <button onClick={onLogout}>Cerrar sesión</button>
          </>
        )}

        {view === 'change-password' && (
          <ChangePassword user={user} onDone={() => setView('home')} />
        )}

        {view === 'settings' && (
          <div>
            <h2>Ajustes</h2>
            <p>Próximamente</p>
          </div>
        )}
      </main>
    </div>
  )
}
