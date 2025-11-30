import React, { useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [user, setUser] = useState(null)

  return (
    <div className="app">
      {!user ? (
        <Login onLogin={(u) => setUser(u)} />
      ) : (
        <Dashboard user={user} onLogout={() => setUser(null)} />
      )}
      <footer className="app-footer">buho software</footer>
    </div>
  )
}
