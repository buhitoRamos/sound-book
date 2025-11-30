import React from 'react'

export default function Dashboard({ user, onLogout }) {
  return (
    <main style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <p>Usuario: {user?.user}</p>
      <p>Rol: {user?.role}</p>
      <button onClick={onLogout}>Cerrar sesión</button>
    </main>
  )
}
