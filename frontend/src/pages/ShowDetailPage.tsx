import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { performancesApi, showsApi } from '../api/api'
import type { Show, Performance } from '../api/types'
import { getGenreConfig, formatDate, formatTime, formatDayMon, formatDuration } from '../utils'

export default function ShowDetailPage() {
  const { showId } = useParams<{ showId: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const [show, setShow] = useState<Show | null>(
    (location.state as { show?: Show } | null)?.show ?? null
  )
  const [performances, setPerformances] = useState<Performance[]>([])
  // mapa performanceId → počet voľných miest
  const [freeSeatsMap, setFreeSeatsMap] = useState<Map<number, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!showId) return
    const id = parseInt(showId)

    const fetchData = async () => {
      try {
        const perfs = await performancesApi.getByShow(id)
        const sorted = perfs.sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
        setPerformances(sorted)

        // Populate show info if not passed via state
        if (!show) {
          if (perfs.length > 0) {
            setShow(perfs[0].show)
          } else {
            const allShows = await showsApi.getAll()
            const found = allShows.find(s => s.id === id)
            if (found) setShow(found)
            else setError('Predstavenie nebolo nájdené.')
          }
        }

        // Načítaj obsadenosť pre každý SCHEDULED termín
        const scheduledPerfs = sorted.filter(p => p.status === 'SCHEDULED')
        const seatMaps = await Promise.all(
          scheduledPerfs.map(p => performancesApi.getSeatMap(p.id))
        )
        const map = new Map<number, number>()
        scheduledPerfs.forEach((p, i) => {
          const free = seatMaps[i].filter(s => !s.occupied).length
          map.set(p.id, free)
        })
        setFreeSeatsMap(map)
      } catch {
        setError('Nepodarilo sa načítať dáta. Skontrolujte, či beží backend.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [showId])

  const handleSelectPerformance = (perf: Performance) => {
    if (perf.status !== 'SCHEDULED') return
    navigate(`/performances/${perf.id}/seats`, {
      state: { performance: perf, show: show ?? perf.show },
    })
  }

  const cfg = show ? getGenreConfig(show.genres) : { icon: '🎭', bgClass: 'drama' }

  if (loading) {
    return (
      <section className="detail-section">
        <div className="loading-wrap"><div className="spinner" /></div>
      </section>
    )
  }

  if (error || !show) {
    return (
      <section className="detail-section">
        <button className="detail-back" onClick={() => navigate('/shows')}>
          Späť na predstavenia
        </button>
        <div className="error-msg">{error || 'Predstavenie nebolo nájdené.'}</div>
      </section>
    )
  }

  return (
    <section className="detail-section">
      <button className="detail-back" onClick={() => navigate('/shows')}>
        Späť na predstavenia
      </button>

      {/* Show info */}
      <div className="detail-grid" style={{ marginBottom: 60 }}>
        <div>
          {show.imageUrl ? (
            <img src={show.imageUrl} alt={show.title} className="detail-poster poster-img" />
          ) : (
            <div className={`detail-poster poster-bg ${cfg.bgClass}`}>
              <span style={{ position: 'relative', zIndex: 1, fontSize: 80, opacity: 0.5 }}>
                {cfg.icon}
              </span>
            </div>
          )}
        </div>
        <div className="detail-info">
          <h2>{show.title}</h2>
          <div className="detail-tags">
            {show.genres.map(g => <span key={g} className="detail-tag">{g}</span>)}
          </div>
          {show.description && (
            <p className="detail-desc">{show.description}</p>
          )}
          <div className="detail-meta">
            <div className="detail-meta-row">
              <span>Dĺžka</span>
              <span>{formatDuration(show.durationMinutes)}</span>
            </div>
            <div className="detail-meta-row">
              <span>Termíny</span>
              <span>{performances.filter(p => p.status === 'SCHEDULED').length} dostupných</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performances list */}
      <div>
        <div className="section-label" style={{ marginBottom: 12 }}>Termíny</div>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
          Vyberte dátum a čas
        </h3>

        {performances.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>Žiadne termíny</h3>
            <p>Pre toto predstavenie zatiaľ nie sú naplánované žiadne termíny.</p>
          </div>
        ) : (
          <div className="performance-list">
            {performances.map(perf => {
              const { day, mon } = formatDayMon(perf.startTime)
              const isCancelled = perf.status === 'CANCELED'
              const isCompleted = perf.status === 'FINISHED'
              const freeSeats = freeSeatsMap.get(perf.id)
              const isSoldOut = perf.status === 'SCHEDULED' && freeSeats === 0
              const isClickable = perf.status === 'SCHEDULED' && !isSoldOut
              return (
                <div
                  key={perf.id}
                  className={`perf-card${isCancelled || isCompleted || isSoldOut ? ' cancelled' : ''}`}
                  onClick={() => isClickable && handleSelectPerformance(perf)}
                  style={isSoldOut ? { cursor: 'default' } : undefined}
                >
                  <div className="perf-date-block">
                    <div className="day">{day}</div>
                    <div className="mon">{mon}</div>
                  </div>
                  <div className="perf-info">
                    <h4>{formatDate(perf.startTime)}</h4>
                    <p>{formatTime(perf.startTime)} · {perf.hall?.name ?? 'Hlavná sála'}</p>
                  </div>
                  <span className={`perf-status ${isSoldOut ? 'soldout' : perf.status.toLowerCase()}`}>
                    {isSoldOut
                      ? 'Vypredané'
                      : perf.status === 'SCHEDULED'
                        ? `Voľné${freeSeats !== undefined ? ` (${freeSeats})` : ''}`
                        : perf.status === 'CANCELED'
                          ? 'Zrušené'
                          : 'Ukončené'}
                  </span>
                  {isClickable && (
                    <span className="perf-arrow">→</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
