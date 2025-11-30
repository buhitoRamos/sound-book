import React, { useState } from 'react'
import './Login.css'
import { supabase } from '../lib/supabaseClient'

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
        .select('id, user, pass')
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
        setLoading(false)
        return
      }

      // Para demo: comparar password en claro (en producción usa hashing)
      if (user.pass !== password) {
        setError('Contraseña incorrecta')
        setLoading(false)
        return
      }

      // Devolver el objeto con la propiedad `user` (como está en la tabla)
      // Si la columna `role` no existe, dejamos `role` indefinido.
      onLogin({ id: user.id, user: user.user, role: user.role })
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

        <div className="login-hint">Usa tus credenciales para acceder.</div>
      </div>
    </div>
  )
}
