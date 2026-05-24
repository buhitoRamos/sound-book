import React, { useState } from 'react'
import './Login.css'
import NoteSVG from '../../assets/music-note.svg'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!username || !password) {
      setError('Por favor ingresa usuario y contraseña')
      return
    }
    setLoading(true)

    try {
      // Buscar en la tabla `users` donde el campo `user` sea igual
      const { data, error: queryError } = await supabase
        .from('users')
        .select('id, user, pass, role, session_version')
        .eq('user', username)
        .limit(1)

      if (queryError) {
        setError('Error consultando usuarios')
        console.error(queryError)
        setLoading(false)
        return
      }

      const user = data && data[0]
      if (!user) {
        setError('Usuario no encontrado')
        toast.error('Usuario no encontrado')
        setLoading(false)
        return
      }

      // Para demo: comparar password en claro (en producción usa hashing)
      if (user.pass !== password) {
        setError('Contraseña incorrecta')
        toast.error('Contraseña incorrecta')
        setLoading(false)
        return
      }

      // Verificar si el usuario está activo en auth_status
      const { data: authData, error: authError } = await supabase
        .from('auth_status')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle()

      if (authError) {
        console.error('Error verificando auth_status:', authError)
        // Si la tabla no existe, permitimos el acceso (fallback)
      } else if (authData && authData.status === false) {
        setError('⚠️ Tu cuenta ha sido desactivada. Por favor comunicate con soporte para más información.')
        toast.error('Cuenta desactivada. Contactá a soporte.', { duration: 6000 })
        setLoading(false)
        return
      }

      // Generar un token simple para la sesión (solo demo)
      const token = btoa(`${user.user}:${Date.now()}`)
      const session = { 
        token, 
        user: { id: user.id, user: user.user, role: user.role },
        session_version: user.session_version || 1
      }
      onLogin(session)
      toast.success('Bienvenido — entrando…')
    } catch (err) {
      console.error(err)
      setError('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      <div className="login-card">
        <img src={NoteSVG} alt="nota musical" className="login-logo" />
        <h1>Sound-Book</h1>
        <p className="muted">Gestión para productores musicales</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Usuario
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ej. admin"
              autoFocus
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="tu contraseña"
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button className="primary" type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <a
          className="login-support-link"
          href="https://wa.me/5491139050391?text=Hola%2C%20quiero%20darme%20de%20alta%20en%20Sound-Book"
          target="_blank"
          rel="noopener noreferrer"
        >
          📱 ¿No tenés cuenta? <strong>Darte de alta por WhatsApp</strong>
        </a>

        <div className="login-hint">Usa tus credenciales para acceder.</div>
        <footer className="app-footer">🦉 buho software</footer>
      </div>
    </div>
  )
}
