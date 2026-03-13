import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import AuthModals from './AuthModals'

export default function Nav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, cartCount, loginModalOpen, registerModalOpen, openLoginModal, openRegisterModal, closeModals } = useApp()

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('klara-theme') as 'dark' | 'light') || 'dark'
  })
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('klara-theme', theme)
  }, [theme])

  // Close modals on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeModals(); setDropdownOpen(false) }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [closeModals])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false)
  }, [location.pathname])

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    setDropdownOpen(false)
    logout()
  }

  return (
    <>
      <nav>
        <a className="logo" onClick={() => navigate('/')}>
          Klára
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
            <div className="user-menu" ref={dropdownRef}>
              <button
                className={`user-menu-trigger${dropdownOpen ? ' open' : ''}`}
                onClick={() => setDropdownOpen(o => !o)}
              >
                <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <span className="user-menu-name">{user.name}</span>
                <svg className="user-menu-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {dropdownOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-avatar">{user.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="user-dropdown-name">{user.name}</div>
                      <div className="user-dropdown-email">{user.email}</div>
                    </div>
                  </div>

                  <div className="user-dropdown-divider" />

                  <button
                    className="user-dropdown-item"
                    onClick={() => navigate('/account')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4"/>
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                    Informácie o účte
                  </button>

                  <button
                    className="user-dropdown-item"
                    onClick={() => navigate('/my-reservations')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <path d="M16 2v4M8 2v4M3 10h18"/>
                      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
                    </svg>
                    Moje rezervácie
                  </button>

                  <div className="user-dropdown-divider" />

                  <button className="user-dropdown-item user-dropdown-logout" onClick={handleLogout}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Odhlásiť sa
                  </button>
                </div>
              )}
            </div>
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
