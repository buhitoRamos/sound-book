import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'
import './ClientsList.css'
import ClientsForm from './ClientsForm'
import Modal from '../Modal/Modal'
import Spinner from '../Spinner/Spinner'
import JobsForm from '../JobsList/JobsForm'

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
  const [creatingJobFor, setCreatingJobFor] = useState(null)
  const [clientFilter, setClientFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  if (!user || !user.id) return <div className="clients-empty">Inicia sesión para ver tus clientes</div>

  return (
    <div className="clients-root">
      <div className="clients-header">
        <h3>Clientes</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="clients-count">{clients.length}</div>
          <input placeholder="Buscar artistas/bandas..." value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(0,0,0,0.06)' }} />
          <button className="btn" onClick={() => { setCreating(true); setEditing(null) }}>Nuevo</button>
        </div>
      </div>
      <Modal open={!!creatingJobFor} title={creatingJobFor ? `Nuevo trabajo para ${creatingJobFor.name}` : ''} onCancel={() => setCreatingJobFor(null)} confirmLabel="Guardar" onConfirm={() => { /* noop: JobsForm handles save */ }}>
        {creatingJobFor && (
          <JobsForm SpinnerComponent={Spinner} initial={{ band_id: creatingJobFor.id }} onSaved={() => { setCreatingJobFor(null); }} onCancel={() => setCreatingJobFor(null)} />
        )}
      </Modal>

      {!creatingJobFor ? (
        <>
          {creating && (
            <ClientsForm SpinnerComponent={Spinner} user={user} initial={null} onSaved={() => { setCreating(false); loadClients() }} onCancel={() => setCreating(false)} />
          )}

          {editing && (
            <ClientsForm SpinnerComponent={Spinner} user={user} initial={editing} onSaved={() => { setEditing(null); loadClients() }} onCancel={() => setEditing(null)} />
          )}
        </>
      ) : null}

      {loading ? (
        <div className="clients-loading"><Spinner message="Cargando clientes…" /></div>
      ) : clients.length === 0 ? (
        <div className="clients-empty">No hay clientes registrados</div>
      ) : (
        <ul className="clients-list">
          {clients.filter(c => {
            if (!clientFilter) return true
            const q = clientFilter.toLowerCase()
            return (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.tel || '').toLowerCase().includes(q)
          }).map((c) => (
            <li key={c.id} className="client-row">
              <div className="client-main">
                <div className="client-top">
                  <div className="client-name">{c.name}</div>
                  <div className="client-gender">{c.gender}</div>
                </div>
                <div className="client-bottom">
                    <div className="client-email"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:8}}><path d="M4 4h16v16H4z"/><polyline points="22,6 12,13 2,6"/></svg>{c.email || 'sin email'}</div>
                    <div className="client-tel"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:8}}><path d="M22 16.92V21a1 1 0 0 1-1.11 1A19 19 0 0 1 3 4.11 1 1 0 0 1 4 3h4.09a1 1 0 0 1 1 .75c.12.57.32 1.12.6 1.63a1 1 0 0 1-.24 1.09L8.91 8.91a16 16 0 0 0 6.19 6.19l1.35-1.53a1 1 0 0 1 1.09-.24c.51.28 1.06.48 1.63.6a1 1 0 0 1 .75 1V22z"/></svg>{c.tel}</div>
                </div>
              </div>
              <div className="client-actions">
                <button className="btn" onClick={() => { setCreatingJobFor(c); onSelect && onSelect(c) }}>Nuevo trabajo</button>
                <button className="btn secondary" onClick={() => setEditing(c)}>Editar</button>
                <button className="btn danger" onClick={() => { setToDelete(c); setModalOpen(true) }}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Modal
        open={modalOpen}
        title="Confirmar eliminación"
        onCancel={() => { setModalOpen(false); setToDelete(null) }}
        onConfirm={async () => {
          if (!toDelete) return
          try {
            const { error } = await supabase.from('bands').delete().eq('id', toDelete.id)
            if (error) throw error
            toast.success('Artista eliminado')
            setModalOpen(false)
            setToDelete(null)
            loadClients()
          } catch (err) {
            console.error(err)
            toast.error('No fue posible eliminar')
          }
        }}
      >
        <p>¿Estás seguro que deseas eliminar a <strong>{toDelete?.name}</strong>?</p>
      </Modal>
    </div>
  )
}
