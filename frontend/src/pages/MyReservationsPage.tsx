import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { usersApi, reservationsApi } from '../api/api'
import type { UserReservation } from '../api/types'
import { formatDate, formatTime } from '../utils'
import Footer from '../components/Footer'

export default function MyReservationsPage() {
  const { user, openLoginModal } = useApp()
  const navigate = useNavigate()
  const [reservations, setReservations] = useState<UserReservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState<number | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    usersApi.getReservations(user.id)
      .then(data => setReservations(data.sort((a, b) => b.id - a.id)))
      .catch(() => setError('Nepodarilo sa načítať rezervácie.'))
      .finally(() => setLoading(false))
  }, [user])

  const handleCancel = async (id: number) => {
    if (!window.confirm('Naozaj chcete zrušiť túto rezerváciu?')) return
    setCancelling(id)
    try {
      await reservationsApi.cancel(id)
      setReservations(prev =>
        prev.map(r => r.id === id ? { ...r, status: 'CANCELED' as const } : r)
      )
    } catch {
      setError('Nepodarilo sa zrušiť rezerváciu. Skúste znova.')
    } finally {
      setCancelling(null)
    }
  }

  if (!user) {
    return (
      <div>
        <section className="my-res-section">
          <div className="empty-state">
            <div className="empty-icon">🔒</div>
            <h3>Prihlásenie vyžadované</h3>
            <p>Pre zobrazenie vašich rezervácií sa musíte prihlásiť.</p>
            <button className="btn-primary" onClick={openLoginModal}>Prihlásiť sa</button>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  if (loading) {
    return (
      <section className="my-res-section">
        <div className="loading-wrap"><div className="spinner" /></div>
      </section>
    )
  }

  const active = reservations.filter(r => r.status === 'ACTIVE')
  const cancelled = reservations.filter(r => r.status === 'CANCELED')

  return (
    <div>
      <section className="my-res-section">
        <div className="section-label">Môj účet</div>
        <div className="my-res-header">
          <h2 className="section-title">Moje rezervácie</h2>
          <div className="my-res-user">
            <span className="my-res-name">{user.name}</span>
            <span className="my-res-email">{user.email}</span>
          </div>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 24 }}>{error}</div>}

        {reservations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎭</div>
            <h3>Žiadne rezervácie</h3>
            <p>Zatiaľ ste si nevytvorili žiadnu rezerváciu.</p>
            <button className="btn-primary" onClick={() => navigate('/shows')}>
              Prezerať predstavenia
            </button>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <div className="my-res-group">
                <div className="my-res-group-label">Aktívne ({active.length})</div>
                <div className="res-list">
                  {active.map(r => (
                    <ReservationCard
                      key={r.id}
                      reservation={r}
                      onCancel={handleCancel}
                      cancelling={cancelling}
                      onShowDetail={() => navigate(`/shows/${r.performance.show.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {cancelled.length > 0 && (
              <div className="my-res-group">
                <div className="my-res-group-label">Zrušené ({cancelled.length})</div>
                <div className="res-list">
                  {cancelled.map(r => (
                    <ReservationCard
                      key={r.id}
                      reservation={r}
                      onCancel={handleCancel}
                      cancelling={cancelling}
                      onShowDetail={() => navigate(`/shows/${r.performance.show.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
      <Footer />
    </div>
  )
}

interface CardProps {
  reservation: UserReservation
  onCancel: (id: number) => void
  cancelling: number | null
  onShowDetail: () => void
}

function ReservationCard({ reservation: r, onCancel, cancelling, onShowDetail }: CardProps) {
  const isCancelled = r.status === 'CANCELED'
  return (
    <div className={`res-card${isCancelled ? ' res-card--cancelled' : ''}`}>
      <div className="res-card-date">
        <div className="res-day">{new Date(r.performance.startTime).getDate()}</div>
        <div className="res-mon">
          {new Date(r.performance.startTime).toLocaleDateString('sk-SK', { month: 'short' }).replace('.', '').trim().toUpperCase()}
        </div>
      </div>

      <div className="res-card-body">
        <h3 className="res-show-title">{r.performance.show.title}</h3>
        <div className="res-meta">
          <span>{formatDate(r.performance.startTime)} · {formatTime(r.performance.startTime)}</span>
          <span className="res-dot">·</span>
          <span>{r.performance.hall?.name ?? 'Hlavná sála'}</span>
          <span className="res-dot">·</span>
          <span>{r.performance.show.genre}</span>
        </div>
        <div className="res-footer-row">
          <span className="res-id">Rezervácia #{r.id}</span>
          <span className="res-created">Vytvorená: {formatDate(r.createdAt)}</span>
        </div>
      </div>

      <div className="res-card-right">
        <div className={`res-status-badge ${isCancelled ? 'cancelled' : 'active'}`}>
          {isCancelled ? 'Zrušená' : 'Aktívna'}
        </div>
        <button className="btn-ghost res-btn-detail" onClick={onShowDetail}>
          Detail predstavenia
        </button>
        {!isCancelled && (
          <button
            className="btn-cancel"
            onClick={() => onCancel(r.id)}
            disabled={cancelling === r.id}
          >
            {cancelling === r.id ? 'Ruším...' : 'Zrušiť rezerváciu'}
          </button>
        )}
      </div>
    </div>
  )
}
