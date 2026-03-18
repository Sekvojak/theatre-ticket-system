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
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('klara-theme', theme)
  }, [theme])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeModals(); setDropdownOpen(false); setMobileOpen(false) }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [closeModals])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    setDropdownOpen(false)
    setMobileOpen(false)
  }, [location.pathname])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    setDropdownOpen(false)
    setMobileOpen(false)
    logout()
  }

  const navTo = (path: string) => { setMobileOpen(false); navigate(path) }

  return (
    <>
      <nav>
        <a className="logo" onClick={() => navigate('/')}>Klára</a>

        <ul className="nav-links">
          <li><a className={isActive('/') ? 'active' : ''} onClick={() => navigate('/')}>Domov</a></li>
          <li><a className={isActive('/shows') ? 'active' : ''} onClick={() => navigate('/shows')}>Predstavenia</a></li>
          <li><a className={isActive('/how') ? 'active' : ''} onClick={() => navigate('/how')}>Ako to funguje</a></li>
        </ul>

        <div className="nav-right">
          <button className="theme-toggle" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} title="Prepnúť tému">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user?.role === 'ADMIN' ? (
            <button
              className={`cart-btn${location.pathname.startsWith('/admin') ? ' has-items' : ''}`}
              title="Admin konzola"
              onClick={() => navigate('/admin')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </button>
          ) : (
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
          )}

          {/* Desktop: user dropdown or auth buttons */}
          <div className="nav-desktop-user">
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
                    <button className="user-dropdown-item" onClick={() => navigate('/account')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                      Informácie o účte
                    </button>
                    <button className="user-dropdown-item" onClick={() => navigate('/my-reservations')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>
                      Moje rezervácie
                    </button>
                    <div className="user-dropdown-divider" />
                    <button className="user-dropdown-item user-dropdown-logout" onClick={handleLogout}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
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

          {/* Hamburger — mobile only */}
          <button
            className={`nav-hamburger${mobileOpen ? ' open' : ''}`}
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}
      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
        <div className="mobile-menu-header">
          <span className="logo">Klára</span>
          <button className="mobile-menu-close" onClick={() => setMobileOpen(false)}>✕</button>
        </div>

        <nav className="mobile-nav-links">
          <a className={isActive('/') ? 'active' : ''} onClick={() => navTo('/')}>Domov</a>
          <a className={isActive('/shows') ? 'active' : ''} onClick={() => navTo('/shows')}>Predstavenia</a>
          <a className={isActive('/how') ? 'active' : ''} onClick={() => navTo('/how')}>Ako to funguje</a>
          {user && (
            <>
              <div className="mobile-nav-divider" />
              <a className={isActive('/my-reservations') ? 'active' : ''} onClick={() => navTo('/my-reservations')}>Moje rezervácie</a>
              <a className={isActive('/account') ? 'active' : ''} onClick={() => navTo('/account')}>Môj účet</a>
              {user.role === 'ADMIN' && (
                <a className={isActive('/admin') ? 'active' : ''} onClick={() => navTo('/admin')}>Admin konzola</a>
              )}
            </>
          )}
        </nav>

        <div className="mobile-menu-footer">
          {user ? (
            <>
              <div className="mobile-user-info">
                <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{user.email}</div>
                </div>
              </div>
              <button className="btn-cancel" style={{ width: '100%', marginTop: 12 }} onClick={handleLogout}>
                Odhlásiť sa
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn-gold" style={{ width: '100%', padding: '13px' }} onClick={() => { setMobileOpen(false); openRegisterModal() }}>Registrácia</button>
              <button className="btn-ghost" style={{ width: '100%', padding: '13px' }} onClick={() => { setMobileOpen(false); openLoginModal() }}>Prihlásiť sa</button>
            </div>
          )}
        </div>
      </div>

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
