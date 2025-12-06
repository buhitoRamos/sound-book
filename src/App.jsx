import React, { useState, useEffect } from 'react'
import Login from './pages/login/Login'
import Dashboard from './pages/dashboard/Dashboard'
import { Toaster } from 'react-hot-toast'

const STORAGE_KEY = 'sb_session'

export default function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const session = JSON.parse(raw)
        if (session?.user) setUser(session.user)
      }
    } catch (err) {
      console.warn('Failed to load session', err)
    }
  }, [])

  function handleLogin(session) {
    // session: { token, user }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } catch (err) {
      console.warn('Failed to save session', err)
    }
    setUser(session.user)
  }

  function handleLogout() {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (err) {
      console.warn('Failed to remove session', err)
    }
    setUser(null)
  }

  return (
    <div className="app">
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
        <Toaster position="bottom-center" />
    </div>
  )
}
