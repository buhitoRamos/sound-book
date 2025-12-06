import React, { useState, useRef, useEffect } from 'react'
import './StatusBar.css'
import NoteSVG from '../../assets/music-note.svg'
import { Toaster, toast } from 'react-hot-toast'

export default function StatusBar({ title = 'Dashboard', onLogout, onMenuSelect }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const ref = useRef()

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  useEffect(() => {
    function onScroll() {
      const isScrolled = window.scrollY > 8
      setScrolled(isScrolled)
      // update global CSS var so siblings can read it
      try {
        document.documentElement.style.setProperty('--statusbar-height', isScrolled ? '48px' : '56px')
      } catch (err) {}
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const cssVars = { '--statusbar-height': scrolled ? '48px' : '56px' }

  return (
    <header className={`statusbar ${scrolled ? 'scrolled' : ''}`} ref={ref} style={cssVars}>
      <div className="status-left">
        <img src={NoteSVG} alt="logo" className="status-logo" />
        <div className="status-title">{title}</div>
      </div>

      <div className="status-right">
        <button className="hamburger" onClick={() => setOpen((s) => !s)} aria-label="abrir menú">
          <span />
          <span />
          <span />
        </button>

        {open && (
          <nav className="menu">
            <button
              className="menu-item"
              onClick={() => {
                setOpen(false)
                onMenuSelect && onMenuSelect('profile')
                toast('Abriendo perfil', { icon: '👤' })
              }}
            >
              Cambiar contraseña
            </button>
            <button
              className="menu-item"
              onClick={() => {
                setOpen(false)
                onMenuSelect && onMenuSelect('artists')
                toast('Artistas/Bandas', { icon: '🎸' })
              }}
            >
              Artistas / Bandas
            </button>

            <button
              className="menu-item"
              onClick={() => {
                setOpen(false)
                onMenuSelect && onMenuSelect('jobs')
                toast('Trabajos', { icon: '📁' })
              }}
            >
              Trabajos
            </button>

            <button
              className="menu-item"
              onClick={() => {
                setOpen(false)
                onMenuSelect && onMenuSelect('payments')
                toast('Pagos', { icon: '💳' })
              }}
            >
              Pagos
            </button>

            <button
              className="menu-item"
              onClick={() => {
                setOpen(false)
                onMenuSelect && onMenuSelect('earnings')
                toast('Ganancias', { icon: '📈' })
              }}
            >
              Ganancias
            </button>

            <button
              className="menu-item"
              onClick={() => {
                setOpen(false)
                onLogout && onLogout()
                toast.success('Sesión cerrada')
              }}
            >
              Cerrar sesión
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}
