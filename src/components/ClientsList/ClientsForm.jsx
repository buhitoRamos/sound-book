import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'
import Spinner from '../Spinner/Spinner'

export default function ClientsForm({ user, initial = null, onSaved, onCancel, SpinnerComponent = Spinner }) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState('')
  const [tel, setTel] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initial) {
      setName(initial.name || '')
      setGender(initial.gender || '')
      setTel(initial.tel || '')
      setEmail(initial.email || '')
    } else {
      setName('')
      setGender('')
      setTel('')
      setEmail('')
    }
  }, [initial])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name) {
      toast.error('Nombre es requerido')
      return
    }
    setLoading(true)
    try {
      if (initial && initial.id) {
        const { error } = await supabase.from('bands').update({ name, gender, tel, email }).eq('id', initial.id)
        if (error) throw error
        toast.success('Artista actualizado')
      } else {
        const payload = { user_id: user.id, name, gender, tel, email }
        const { error } = await supabase.from('bands').insert(payload)
        if (error) throw error
        toast.success('Artista creado')
      }
      onSaved && onSaved()
    } catch (err) {
      console.error(err)
      toast.error('No fue posible guardar el artista')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
      <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Género" value={gender} onChange={(e) => setGender(e.target.value)} />
      <input placeholder="Teléfono" value={tel} onChange={(e) => setTel(e.target.value)} />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <SpinnerComponent message="Guardando…" />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" type="submit">Guardar</button>
          <button type="button" className="btn secondary" onClick={() => onCancel && onCancel()}>Cancelar</button>
        </div>
      )}
    </form>
  )
}
