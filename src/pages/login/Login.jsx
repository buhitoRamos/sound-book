import React, { useState } from 'react'
import './Login.css'
import NoteSVG from '../../assets/music-note.svg'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'

export default function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dni, setDni] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    if (isRegistering) {
      if (!username || !password || !confirmPassword || !firstName || !lastName || !dni || !phone) {
        setError('Por favor completa todos los campos')
        return false
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden')
        return false
      }
      if (username.length < 2) {
        setError('El usuario es muy corto')
        return false
      }
    } else {
      if (!username || !password) {
        setError('Por favor ingresa usuario y contraseña')
        return false
      }
    }
    setError('')
    return true
  }

  const handleRegister = async () => {
    setLoading(true)
    setError('')
    try {
      const { data: existingUser, error: dniError } = await supabase
        .from('users')
        .select('id')
        .eq('dni', dni.trim())
        .single()

      if (dniError && dniError.code !== 'PGRST116') throw dniError
      if (existingUser) {
        throw new Error('Este DNI ya tiene una cuenta gratis')
      }

      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([
          {
            user: username.trim(),
            pass: password,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            dni: dni.trim(),
            phone: phone.trim(),
            role: 'user',
          },
        ])
        .select()
        .single()

      if (userError) throw userError

      const { error: statusError } = await supabase
        .from('auth_status')
        .insert([{ user_id: newUser.id, status: true }])

      if (statusError) throw statusError

      const token = btoa(`${newUser.user}:${Date.now()}`)
      const session = { 
        token, 
        user: { id: newUser.id, user: newUser.user, role: newUser.role },
        session_version: newUser.session_version || 1
      }
      onLogin(session)
      toast.success('Cuenta creada. Bienvenido!')
    } catch (err) {
      setError(err.message || 'Error al crear la cuenta')
      toast.error(err.message || 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setLoading(true)

    if (isRegistering) {
      await handleRegister()
      return
    }

    try {
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

      if (user.pass !== password) {
        setError('Contraseña incorrecta')
        toast.error('Contraseña incorrecta')
        setLoading(false)
        return
      }

      const { data: authData, error: authError } = await supabase
        .from('auth_status')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle()

      if (authError) {
        console.error('Error verificando auth_status:', authError)
      } else if (authData && authData.status === false) {
        setError('⚠️ Tu cuenta ha sido desactivada. Por favor comunicate con soporte para más información.')
        toast.error('Cuenta desactivada. Contactá a soporte.', { duration: 6000 })
        setLoading(false)
        return
      }

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

          <label className="password-container">
            Contraseña
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="tu contraseña"
              />
              <button 
                type="button" 
                className="password-toggle" 
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </label>

          {isRegistering && (
            <>
              <label className="password-container">
                Confirmar Contraseña
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="tu contraseña"
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </label>
              <label>
                Nombre
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nombre"
                />
              </label>
              <label>
                Apellido
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Apellido"
                />
              </label>
              <label>
                DNI
                <input
                  type="text"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="DNI"
                />
              </label>
              <label>
                Teléfono
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="549..."
                />
              </label>
            </>
          )}

          {error && <div className="login-error">{error}</div>}

          <button className="primary" type="submit" disabled={loading}>
            {loading ? 'Procesando...' : isRegistering ? 'Registrarse' : 'Ingresar'}
          </button>
        </form>

        <div className="login-footer">
          {isRegistering ? (
            <button 
              type="button" 
              className="login-toggle-btn" 
              onClick={() => { setIsRegistering(false); setError(''); }}
            >
              ¿Ya tenés cuenta? <strong>Iniciar sesión</strong>
            </button>
          ) : (
            <button 
              type="button" 
              className="login-toggle-btn" 
              onClick={() => { setIsRegistering(true); setError(''); }}
            >
              ¿No tenés cuenta? <strong>Crear cuenta gratis</strong>
            </button>
          )}
          <a
            className="login-support-link"
            href="https://wa.me/5491139050391?text=Hola%2C%20quiero%20soporte%20de%20Sound-Book"
            target="_blank"
            rel="noopener noreferrer"
          >
            📱 Soporte Técnico
          </a>
        </div>

        <div className="login-hint">Usa tus credenciales para acceder.</div>
        <footer className="app-footer">🦉 buho software</footer>
      </div>
    </div>
  )
}
