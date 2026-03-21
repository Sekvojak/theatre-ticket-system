import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { reservationsApi } from '../../api/api'
import type { AdminReservation } from '../../api/types'

type FilterStatus = 'ALL' | 'ACTIVE' | 'CANCELED'

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminReservationsPage() {
  const navigate = useNavigate()
  const [reservations, setReservations] = useState<AdminReservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('ALL')
  const [cancelConfirm, setCancelConfirm] = useState<number | null>(null)

  useEffect(() => {
    reservationsApi.getAll()
      .then(setReservations)
      .catch(() => setError('Nepodarilo sa načítať rezervácie.'))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id: number) => {
    try {
      await reservationsApi.cancel(id)
      setReservations(rs => rs.map(r => r.id === id ? { ...r, status: 'CANCELED' } : r))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Nepodarilo sa zrušiť rezerváciu.')
    }
    setCancelConfirm(null)
  }

  const filtered = filter === 'ALL' ? reservations : reservations.filter(r => r.status === filter)
  const activeCount = reservations.filter(r => r.status === 'ACTIVE').length
  const canceledCount = reservations.filter(r => r.status === 'CANCELED').length

  return (
    <section className="admin-section">
      <button className="detail-back" onClick={() => navigate('/admin')}>Dashboard</button>
      <div className="admin-page-header">
        <div>
          <div className="section-label">Admin konzola</div>
          <h2 className="section-title">Rezervácie</h2>
        </div>
        <div className="admin-res-stats">
          <span className="admin-stat"><span className="admin-stat-val">{activeCount}</span> aktívnych</span>
          <span className="admin-stat"><span className="admin-stat-val admin-stat-muted">{canceledCount}</span> zrušených</span>
        </div>
      </div>

      <div className="filters" style={{ marginBottom: 28 }}>
        {(['ALL', 'ACTIVE', 'CANCELED'] as FilterStatus[]).map(f => (
          <button
            key={f}
            className={`filter-btn${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'Všetky' : f === 'ACTIVE' ? 'Aktívne' : 'Zrušené'}
          </button>
        ))}
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>Žiadne rezervácie</h3>
          <p>Pre zvolený filter neboli nájdené žiadne rezervácie.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Inscenácia</th>
                <th>Hranie</th>
                <th>Zákazník</th>
                <th>Sedadlá</th>
                <th>Vytvorená</th>
                <th>Stav</th>
                <th>Akcie</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                return (
                  <tr key={r.id} className={r.status === 'CANCELED' ? 'admin-tr-canceled' : ''}>
                    <td className="admin-td-id">{r.id}</td>
                    <td className="admin-td-main">{r.showTitle ?? '—'}</td>
                    <td>{r.performanceStart ? formatDateTime(r.performanceStart) : '—'}</td>
                    <td>
                      {r.customerName ? (
                        <span className="admin-badge">{r.customerName}</span>
                      ) : (
                        <span>—</span>
                      )}
                      {r.customerEmail && (
                        <>
                          <br />
                          <small style={{ color: 'var(--muted)' }}>{r.customerEmail}</small>
                        </>
                      )}
                    </td>
                    <td>{r.seatLabels && r.seatLabels.length > 0 ? r.seatLabels.join(', ') : '—'}</td>
                    <td>{formatDateTime(r.createdAt)}</td>
                    <td>
                      <span className={`res-status-badge ${r.status.toLowerCase()}`}>
                        {r.status === 'ACTIVE' ? 'Aktívna' : 'Zrušená'}
                      </span>
                    </td>
                    <td>
                      {r.status === 'ACTIVE' && (
                        <div className="admin-actions">
                          {cancelConfirm === r.id ? (
                            <>
                              <button className="admin-btn-confirm-del" onClick={() => handleCancel(r.id)}>Potvrdiť</button>
                              <button className="admin-btn-cancel-del" onClick={() => setCancelConfirm(null)}>Zrušiť</button>
                            </>
                          ) : (
                            <button className="btn-cancel" onClick={() => setCancelConfirm(r.id)}>Zrušiť</button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
