import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { authApi } from '../api/api'
// useApp is used only in LoginModal

interface AuthModalsProps {
  loginOpen: boolean
  registerOpen: boolean
  onClose: () => void
  onSwitchToRegister: () => void
  onSwitchToLogin: () => void
}

function LoginModal({ onClose, onSwitch }: { onClose: () => void; onSwitch: () => void }) {
  const { setUser } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(email, password)
      setUser({ id: res.id, name: res.name, email: res.email, role: res.role }, res.token)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri prihlasovaní.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <span className="modal-logo">Klára</span>
        <h2>Prihlásiť sa</h2>
        <p className="modal-sub">Vitajte späť. Prihláste sa pre prístup k vašim rezerváciám.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vas@email.sk"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Heslo</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button className="btn-form" type="submit" disabled={loading}>
            {loading ? 'Prihlasujem...' : 'Prihlásiť sa'}
          </button>
        </form>
        <div className="modal-divider">alebo</div>
        <p className="modal-switch">
          Nemáte účet? <a onClick={onSwitch}>Zaregistrujte sa</a>
        </p>
      </div>
    </div>
  )
}

function RegisterModal({ onClose, onSwitch }: { onClose: () => void; onSwitch: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.register(name, email, password)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri registrácii.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
        <div className="modal">
          <button className="modal-close" onClick={onClose}>✕</button>
          <span className="modal-logo">Klára</span>
          <div className="verify-sent-icon">✉</div>
          <h2>Skontrolujte email</h2>
          <p className="modal-sub">
            Poslali sme overovací odkaz na <strong>{email}</strong>.<br />
            Kliknite naň a aktivujte účet. Potom sa môžete prihlásiť.
          </p>
          <button className="btn-form" onClick={onSwitch}>Prihlásiť sa</button>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <span className="modal-logo">Klára</span>
        <h2>Registrácia</h2>
        <p className="modal-sub">Vytvorte si účet a sledujte históriu svojich rezervácií.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Meno a priezvisko</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ján Novák"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vas@email.sk"
              required
            />
          </div>
          <div className="form-group">
            <label>Heslo</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button className="btn-form" type="submit" disabled={loading}>
            {loading ? 'Registrujem...' : 'Vytvoriť účet'}
          </button>
        </form>
        <div className="modal-divider">alebo</div>
        <p className="modal-switch">
          Máte účet? <a onClick={onSwitch}>Prihláste sa</a>
        </p>
      </div>
    </div>
  )
}

export default function AuthModals({ loginOpen, registerOpen, onClose, onSwitchToRegister, onSwitchToLogin }: AuthModalsProps) {
  if (loginOpen) return <LoginModal onClose={onClose} onSwitch={onSwitchToRegister} />
  if (registerOpen) return <RegisterModal onClose={onClose} onSwitch={onSwitchToLogin} />
  return null
}
