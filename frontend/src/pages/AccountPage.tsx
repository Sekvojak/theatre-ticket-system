import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Footer from '../components/Footer'

export default function AccountPage() {
  const { user, logout, openLoginModal } = useApp()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div>
        <section className="my-res-section">
          <div className="empty-state">
            <div className="empty-icon">🔒</div>
            <h3>Prihlásenie vyžadované</h3>
            <p>Pre zobrazenie informácií o účte sa musíte prihlásiť.</p>
            <button className="btn-primary" onClick={openLoginModal}>Prihlásiť sa</button>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div>
      <section className="my-res-section">
        <div className="section-label">Môj účet</div>
        <h2 className="section-title" style={{ marginBottom: 48 }}>Informácie o účte</h2>

        <div className="account-card">
          <div className="account-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div className="account-info">
            <div className="account-row">
              <span className="account-label">Meno</span>
              <span className="account-value">{user.name}</span>
            </div>
            <div className="account-row">
              <span className="account-label">E-mail</span>
              <span className="account-value">{user.email}</span>
            </div>
            <div className="account-row">
              <span className="account-label">Rola</span>
              <span className="account-value">
                <span className="account-role-badge">{user.role ?? 'ZÁKAZNÍK'}</span>
              </span>
            </div>
            <div className="account-row">
              <span className="account-label">ID používateľa</span>
              <span className="account-value" style={{ color: 'var(--muted)' }}>#{user.id}</span>
            </div>
          </div>
        </div>

        <div className="account-actions">
          <button className="btn-primary" onClick={() => navigate('/my-reservations')}>
            Zobraziť moje rezervácie
          </button>
          <button className="btn-ghost" onClick={handleLogout}>
            Odhlásiť sa
          </button>
        </div>
      </section>
      <Footer />
    </div>
  )
}
