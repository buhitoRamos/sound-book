import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'
import './ClientsList.css'
import ClientsForm from './ClientsForm'
import Spinner from '../Spinner/Spinner'

export default function ClientsList({ user, onSelect }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)

  const loadClients = useCallback(async () => {
    if (!user || !user.id) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bands')
        .select('id, created_at, user_id, name, gender, tel, email')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (err) {
      console.error('Error fetching clients', err)
      toast.error('No fue posible cargar clientes')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)

  if (!user || !user.id) return <div className="clients-empty">Inicia sesión para ver tus clientes</div>

  return (
    <div className="clients-root">
      <div className="clients-header">
        <h3>Clientes</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="clients-count">{clients.length}</div>
          <button className="btn" onClick={() => { setCreating(true); setEditing(null) }}>Nuevo</button>
        </div>
      </div>

      {creating && (
        <ClientsForm SpinnerComponent={Spinner} user={user} initial={null} onSaved={() => { setCreating(false); loadClients() }} onCancel={() => setCreating(false)} />
      )}

      {editing && (
        <ClientsForm SpinnerComponent={Spinner} user={user} initial={editing} onSaved={() => { setEditing(null); loadClients() }} onCancel={() => setEditing(null)} />
      )}

      {loading ? (
        <div className="clients-loading"><Spinner message="Cargando clientes…" /></div>
      ) : clients.length === 0 ? (
        <div className="clients-empty">No hay clientes registrados</div>
      ) : (
        <ul className="clients-list">
          {clients.map((c) => (
            <li key={c.id} className="client-row">
              <div className="client-main">
                <div className="client-name">{c.name}</div>
                <div className="client-meta">{c.gender} · {c.email || 'sin email'}</div>
              </div>
              <div className="client-actions">
                <button className="btn" onClick={() => onSelect && onSelect(c)}>Seleccionar</button>
                <button className="btn secondary" onClick={() => setEditing(c)}>Editar</button>
                <button className="btn danger" onClick={async () => {
                  if (!confirm('Eliminar artista?')) return
                  try {
                    const { error } = await supabase.from('bands').delete().eq('id', c.id)
                    if (error) throw error
                    toast.success('Artista eliminado')
                    loadClients()
                  } catch (err) {
                    console.error(err)
                    toast.error('No fue posible eliminar')
                  }
                }}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
