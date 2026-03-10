import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import AuthModals from './AuthModals'

export default function Nav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, cartCount, loginModalOpen, registerModalOpen, openLoginModal, openRegisterModal, closeModals } = useApp()

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theatreX-theme') as 'dark' | 'light') || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theatreX-theme', theme)
  }, [theme])

  // Close modals on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModals() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [closeModals])

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      <nav>
        <a className="logo" onClick={() => navigate('/')}>
          Theatre<span>X</span>
        </a>

        <ul className="nav-links">
          <li>
            <a className={isActive('/') ? 'active' : ''} onClick={() => navigate('/')}>
              Domov
            </a>
          </li>
          <li>
            <a className={isActive('/shows') ? 'active' : ''} onClick={() => navigate('/shows')}>
              Predstavenia
            </a>
          </li>
          <li>
            <a className={isActive('/how') ? 'active' : ''} onClick={() => navigate('/how')}>
              Ako to funguje
            </a>
          </li>
        </ul>

        <div className="nav-right">
          <button
            className="theme-toggle"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title="Prepnúť tému"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button
            className={`cart-btn${cartCount > 0 ? ' has-items' : ''}`}
            title="Košík"
            onClick={() => navigate('/shows')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <span className={`cart-badge${cartCount > 0 ? ' visible' : ''}`}>{cartCount}</span>
          </button>

          {user ? (
            <>
              <span className="nav-user">👤 {user.name}</span>
              <button className="btn-ghost" onClick={logout}>Odhlásiť</button>
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={openLoginModal}>Prihlásiť sa</button>
              <button className="btn-gold" onClick={openRegisterModal}>Registrácia</button>
            </>
          )}
        </div>
      </nav>

      <AuthModals
        loginOpen={loginModalOpen}
        registerOpen={registerModalOpen}
        onClose={closeModals}
        onSwitchToRegister={openRegisterModal}
        onSwitchToLogin={openLoginModal}
      />
    </>
  )
}
