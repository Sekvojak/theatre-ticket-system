import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { performancesApi } from '../api/api'
import type { Performance } from '../api/types'
import Footer from '../components/Footer'
import { formatDayMon, formatTime } from '../utils'

function FeaturedCard({ perf, big, onClick }: { perf: Performance; big: boolean; onClick: () => void }) {
  const { day, mon } = formatDayMon(perf.startTime)
  return (
    <div className={`featured-card${big ? ' big' : ''}`} onClick={onClick}>
      {big ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
            <div className="card-date"><div className="day">{day}</div><div className="mon">{mon}</div></div>
            <div className="card-info" style={{ flex: 1 }}>
              <h3>{perf.show.title}</h3>
              <p>{perf.show.genre} · {formatTime(perf.startTime)}</p>
            </div>
            <div className="card-badge">Najbližšie</div>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.6 }}>
            {perf.show.description ?? `${perf.show.genre} · ${perf.hall?.name ?? 'Hlavná sála'}`}
          </div>
        </>
      ) : (
        <>
          <div className="card-date"><div className="day">{day}</div><div className="mon">{mon}</div></div>
          <div className="card-info">
            <h3>{perf.show.title}</h3>
            <p>{perf.show.genre} · {formatTime(perf.startTime)}</p>
          </div>
          <div className="card-badge">Voľné</div>
        </>
      )}
    </div>
  )
}

// Static placeholder cards shown when backend has no data
function PlaceholderCards() {
  return (
    <>
      <div className="featured-card big" style={{ opacity: 0.4, cursor: 'default' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
          <div className="card-date"><div className="day">—</div><div className="mon">—</div></div>
          <div className="card-info" style={{ flex: 1 }}><h3>Načítavam...</h3><p>Pripájam sa k backendu</p></div>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '12px' }}>
          Spustite backend a obnovte stránku.
        </div>
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="featured-card" style={{ opacity: 0.25, cursor: 'default' }}>
          <div className="card-date"><div className="day">—</div><div className="mon">—</div></div>
          <div className="card-info"><h3>Predstavenie {i}</h3><p>Čakám na dáta...</p></div>
        </div>
      ))}
    </>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [upcoming, setUpcoming] = useState<Performance[]>([])

  useEffect(() => {
    performancesApi.getAll()
      .then(perfs => {
        const sorted = perfs
          .filter(p => p.status === 'SCHEDULED')
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
          .slice(0, 4)
        setUpcoming(sorted)
      })
      .catch(() => {}) // silently fail — placeholders are shown
  }, [])

  return (
    <div id="page-home">
      <section className="hero">
        <div className="hero-left">
          <div className="hero-tag">Sezóna 2025 / 2026</div>
          <h1>Zažite<br />divadlo<br /><em>naživo</em></h1>
          <p className="hero-sub">
            Rezervujte si miesto na najlepšie predstavenia sezóny. Jednoduchý výber sedadiel,
            rýchla rezervácia – bez nutnosti registrácie.
          </p>
          <div className="hero-cta">
            <button className="btn-primary" onClick={() => navigate('/shows')}>
              Prezerať predstavenia
            </button>
            <button className="btn-outline" onClick={() => navigate('/how')}>
              Ako to funguje
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-right-label">Najbližšie predstavenia</div>
          {upcoming.length === 0 ? (
            <PlaceholderCards />
          ) : (
            upcoming.map((perf, i) => (
              <FeaturedCard
                key={perf.id}
                perf={perf}
                big={i === 0}
                onClick={() => navigate(`/shows/${perf.show.id}`, { state: { show: perf.show } })}
              />
            ))
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
