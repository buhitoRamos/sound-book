import React, { useState } from 'react'
import StatusBar from '../../components/StatusBar/StatusBar'
import ChangePassword from '../../components/ChangePassword/ChangePassword'
import ClientsList from '../../components/ClientsList/ClientsList'
import Spinner from '../../components/Spinner/Spinner'

export default function Dashboard({ user, onLogout }) {
  const [view, setView] = useState('artists')

  function handleMenuSelect(key) {
    if (key === 'artists') setView('artists')
    if (key === 'profile') setView('change-password')
    if (key === 'settings') setView('settings')
  }

  return (
    <div>
      <StatusBar title="Dashboard" onLogout={onLogout} onMenuSelect={handleMenuSelect} />
      <main style={{ padding: 20, paddingTop: 'calc(8px + var(--statusbar-height))' }}>
        {view === 'artists' && (
          <>
            <h1>Artistas / Bandas</h1>
            <p>Usuario: {user?.user}</p>
            <ClientsList SpinnerComponent={Spinner} user={user} onSelect={(c) => console.log('selected', c)} />
          </>
        )}

        {view === 'change-password' && (
          <ChangePassword SpinnerComponent={Spinner} user={user} onDone={() => setView('artists')} />
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
