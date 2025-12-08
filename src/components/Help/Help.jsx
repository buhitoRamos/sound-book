import React from 'react'
import './Help.css'

export default function Help() {
  return (
    <div className="help-root">
      <h2>📖 Guía de Uso - Sound-Book</h2>
      
      <div className="help-section">
        <h3>🎸 Artistas / Bandas</h3>
        <p>Aquí puedes gestionar tus clientes (artistas y bandas).</p>
        <ul>
          <li><strong>Crear nuevo:</strong> Haz clic en "Nuevo" para agregar un artista o banda</li>
          <li><strong>Editar:</strong> Haz clic en "✏️" para modificar los datos</li>
          <li><strong>Crear trabajo:</strong> Usa el botón "➕ Trabajo" para crear un trabajo asociado al artista</li>
          <li><strong>Buscar:</strong> Usa el campo de búsqueda para filtrar por nombre</li>
        </ul>
      </div>

      <div className="help-section">
        <h3>📁 Trabajos</h3>
        <p>Gestiona todos tus proyectos de audio (masterización, mezcla, edición, etc.).</p>
        <ul>
          <li><strong>Crear trabajo:</strong> Completa el formulario con:
            <ul>
              <li>Descripción del trabajo</li>
              <li>Monto total y moneda (ARS, USD, EUR)</li>
              <li>Pago inicial (opcional)</li>
              <li>Estado (En progreso, Finalizado, Cancelado)</li>
              <li>Gastos del proyecto</li>
            </ul>
          </li>
          <li><strong>Pago inicial:</strong> Si ingresas un monto, se creará automáticamente un registro en Pagos</li>
          <li><strong>Google Calendar:</strong> Si tienes permisos, podrás agendar el trabajo en tu calendario</li>
          <li><strong>Filtrar:</strong> Usa los selectores para filtrar por banda o buscar por texto</li>
        </ul>
      </div>

      <div className="help-section">
        <h3>💳 Pagos</h3>
        <p>Registra y sigue los pagos de tus trabajos.</p>
        <ul>
          <li><strong>Nuevo pago:</strong> Haz clic en "Editar" en cualquier trabajo para registrar un pago</li>
          <li><strong>Deuda:</strong> El sistema calcula automáticamente: Monto Total - Pagos Recibidos</li>
          <li><strong>Estado del trabajo:</strong> Puedes cambiar el estado (Finalizado/Cancelado) al registrar un pago</li>
          <li><strong>Visualización:</strong> La deuda aparece en rojo cuando hay saldo pendiente</li>
          <li><strong>Filtrar:</strong> Selecciona una banda para ver solo sus pagos</li>
        </ul>
      </div>

      <div className="help-section">
        <h3>📈 Ganancias</h3>
        <p>Visualiza tus ingresos y egresos por moneda y periodo.</p>
        <ul>
          <li><strong>Total Anual:</strong> Resumen por moneda (ARS, USD, EUR)</li>
          <li><strong>Desglose Mensual:</strong> Tabla con ganancias mes a mes</li>
          <li><strong>Cálculo:</strong> Ganancias = Pagos Recibidos - Gastos de Trabajos</li>
          <li><strong>Filtrar por año:</strong> Usa el selector para cambiar el año</li>
        </ul>
      </div>

      <div className="help-section">
        <h3>🔐 Seguridad</h3>
        <ul>
          <li><strong>Cambiar contraseña:</strong> Disponible en el menú principal</li>
          <li><strong>Datos privados:</strong> Solo ves tus propios trabajos, pagos y bandas</li>
          <li><strong>Cerrar sesión:</strong> Siempre cierra sesión cuando termines</li>
        </ul>
      </div>

      <div className="help-section">
        <h3>💡 Consejos</h3>
        <ul>
          <li>Registra los pagos apenas los recibas para mantener la deuda actualizada</li>
          <li>Usa el campo "Detalle" en pagos para notas importantes</li>
          <li>Revisa las Ganancias mensualmente para analizar tu rendimiento</li>
          <li>Marca los trabajos como "Finalizados" cuando estén completos</li>
        </ul>
      </div>

      <div className="help-footer">
        <p>¿Necesitas más ayuda? <a href="mailto:cym.martin85@gmail.com">Contacta al administrador</a></p>
        <p style={{ marginTop: 8, fontSize: '0.9em', color: '#64748b' }}>Creado por buh!to</p>
      </div>
    </div>
  )
}
