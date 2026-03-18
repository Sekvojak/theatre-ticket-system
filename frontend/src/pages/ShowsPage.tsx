import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { showsApi, performancesApi } from '../api/api'
import type { Show, Performance } from '../api/types'
import { getGenreConfig, formatDate, formatTime } from '../utils'

export default function ShowsPage() {
  const navigate = useNavigate()
  const [shows, setShows] = useState<Show[]>([])
  const [performances, setPerformances] = useState<Performance[]>([])
  const [activeGenre, setActiveGenre] = useState('Všetky')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([showsApi.getAll(), performancesApi.getAll()])
      .then(([s, p]) => {
        setShows(s)
        setPerformances(p)
      })
      .catch(() => setError('Nepodarilo sa načítať predstavenia. Skontrolujte, či beží backend.'))
      .finally(() => setLoading(false))
  }, [])

  const genres = ['Všetky', ...Array.from(new Set(shows.flatMap(s => s.genres)))]

  const filteredShows = activeGenre === 'Všetky'
    ? shows
    : shows.filter(s => s.genres.includes(activeGenre))

  function getNextPerformance(showId: number): Performance | undefined {
    return performances
      .filter(p => p.show.id === showId && p.status === 'SCHEDULED')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0]
  }

  const handleShowClick = (show: Show) => {
    navigate(`/shows/${show.id}`, { state: { show } })
  }

  if (loading) {
    return (
      <div className="shows-section" style={{ paddingTop: 120 }}>
        <div className="loading-wrap"><div className="spinner" /></div>
      </div>
    )
  }

  return (
    <section className="shows-section">
      <div className="section-header">
        <div>
          <div className="section-label">Repertoár</div>
          <h2 className="section-title">Aktuálne predstavenia</h2>
        </div>
        <div className="filters">
          {genres.map(g => (
            <button
              key={g}
              className={`filter-btn${activeGenre === g ? ' active' : ''}`}
              onClick={() => setActiveGenre(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {!error && filteredShows.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">🎭</div>
          <h3>Žiadne predstavenia</h3>
          <p>V databáze zatiaľ nie sú žiadne predstavenia.</p>
        </div>
      )}

      <div className="shows-grid">
        {filteredShows.map(show => {
          const cfg = getGenreConfig(show.genres)
          const next = getNextPerformance(show.id)
          return (
            <div key={show.id} className="show-card" onClick={() => handleShowClick(show)}>
              <div className="show-poster">
                {show.imageUrl ? (
                  <img src={show.imageUrl} alt={show.title} className="poster-img" />
                ) : (
                  <>
                    <div className={`poster-bg ${cfg.bgClass}`} />
                    <div className="poster-icon">{cfg.icon}</div>
                  </>
                )}
                <div className="poster-tag">{show.genres.join(' · ')}</div>
              </div>
              <div className="show-body">
                <h3>{show.title}</h3>
                <div className="show-meta">
                  {next ? (
                    <>
                      <span>{formatDate(next.startTime)}</span>
                      <span>{formatTime(next.startTime)}</span>
                    </>
                  ) : (
                    <span>Žiadny termín</span>
                  )}
                  <span>{Math.floor(show.durationMinutes / 60)}h {show.durationMinutes % 60 > 0 ? `${show.durationMinutes % 60}min` : ''}</span>
                </div>
                <div className="show-footer">
                  <div className="show-next">
                    {next ? (
                      <><strong>{next.hall?.name ?? 'Hlavná sála'}</strong></>
                    ) : (
                      <span style={{ color: 'var(--muted)' }}>Bez termínu</span>
                    )}
                  </div>
                  <button
                    className="btn-reserve"
                    onClick={e => { e.stopPropagation(); handleShowClick(show) }}
                  >
                    Rezervovať
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
