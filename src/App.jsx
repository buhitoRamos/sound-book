import React, { useState, useEffect } from 'react'
import Login from './pages/login/Login'
import Dashboard from './pages/dashboard/Dashboard'
import { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabaseClient'

const STORAGE_KEY = 'sb_session'

export default function App() {
  const [user, setUser] = useState(null)

  // Validate session against database
  async function validateSession(session) {
    if (!session?.user?.id) return false
    try {
      const { data, error } = await supabase
        .from('users')
        .select('session_version')
        .eq('id', session.user.id)
        .single()
      
      if (error || !data) return false
      
      // Check if session version matches
      const storedVersion = session.session_version || 1
      const dbVersion = data.session_version || 1
      
      return storedVersion === dbVersion
    } catch (err) {
      console.error('Session validation error:', err)
      return false
    }
  }

  useEffect(() => {
    async function loadSession() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const session = JSON.parse(raw)
          if (session?.user) {
            // Validate session on load
            const isValid = await validateSession(session)
            if (isValid) {
              setUser(session.user)
            } else {
              // Session invalid, logout
              localStorage.removeItem(STORAGE_KEY)
              setUser(null)
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load session', err)
      }
    }
    loadSession()
  }, [])

  // Periodically check session validity
  useEffect(() => {
    if (!user) return

    const interval = setInterval(async () => {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const session = JSON.parse(raw)
        const isValid = await validateSession(session)
        if (!isValid) {
          handleLogout()
        }
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [user])

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
