import React, { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'
import './ChangePassword.css'
import Spinner from '../Spinner/Spinner'

export default function ChangePassword({ user, onDone, onLogout, SpinnerComponent = Spinner }) {
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  async function handleChange(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!currentPass || !newPass) {
      setError('Completa ambos campos')
      return
    }
    setLoading(true)
    try {
      // obtener el usuario actual desde la tabla
      const { data, error: qErr } = await supabase.from('users').select('id, pass, session_version').eq('user', user.user).limit(1)
      if (qErr) throw qErr
      const u = data && data[0]
      if (!u) {
        setError('Usuario no encontrado')
        toast.error('No fue posible cambiar la contraseña: usuario no encontrado')
        setLoading(false)
        return
      }
      if (u.pass !== currentPass) {
        setError('Contraseña actual incorrecta')
        toast.error('No fue posible cambiar la contraseña: contraseña actual incorrecta')
        setLoading(false)
        return
      }

      // Increment session_version to invalidate all existing sessions
      const currentVersion = u.session_version || 1
      const { error: upErr } = await supabase.from('users').update({ 
        pass: newPass,
        session_version: currentVersion + 1
      }).eq('id', u.id)
      if (upErr) throw upErr

      setSuccess('Contraseña actualizada')
      toast.success('Contraseña cambiada. Vuelve a iniciar sesión')
      
      // Wait a moment for the toast to be visible, then logout
      setTimeout(() => {
        onLogout && onLogout()
      }, 1500)
    } catch (err) {
      console.error(err)
      setError('Error actualizando contraseña')
      toast.error('No fue posible cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="cp-root">
      <h2>Cambiar contraseña</h2>
      <form onSubmit={handleChange} className="cp-form">
        <div className="cp-field">
          <label htmlFor="current-pass">Contraseña actual</label>
          <input
            id="current-pass"
            aria-label="Contraseña actual"
            placeholder="Tu contraseña actual"
            type={showCurrent ? 'text' : 'password'}
            value={currentPass}
            onChange={(e) => setCurrentPass(e.target.value)}
          />
          <button type="button" className="cp-toggle" onClick={() => setShowCurrent((s) => !s)} aria-label={showCurrent ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
            {showCurrent ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        <div className="cp-field">
          <label htmlFor="new-pass">Nueva contraseña</label>
          <input
            id="new-pass"
            aria-label="Nueva contraseña"
            placeholder="Nueva contraseña"
            type={showNew ? 'text' : 'password'}
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
          <button type="button" className="cp-toggle" onClick={() => setShowNew((s) => !s)} aria-label={showNew ? 'Ocultar contraseña nueva' : 'Mostrar contraseña nueva'}>
            {showNew ? 'Ocultar' : 'Mostrar'}
          </button>
          <span className="helper">Usa al menos 8 caracteres y evita contraseñas comunes</span>
        </div>

        {error && <div className="cp-feedback cp-error">{error}</div>}
        {success && <div className="cp-feedback cp-success">{success}</div>}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
            <SpinnerComponent message="Guardando..." />
          </div>
        ) : (
          <div className="cp-actions">
            <button className="primary" disabled={loading} type="submit">Guardar</button>
            <button type="button" className="secondary" onClick={() => onDone && onDone()}>Cancelar</button>
          </div>
        )}
      </form>
    </section>
  )
}
