import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { showsApi, performancesApi, reservationsApi, seatsApi } from '../../api/api'
import type { Show, Performance, AdminReservation, Seat } from '../../api/types'

interface Stats {
  totalRevenue: number
  soldTickets: number
  avgOccupancy: number
  activeReservations: number
  canceledReservations: number
  topShows: { show: Show; reservations: number; tickets: number; revenue: number }[]
  genreBreakdown: { genre: string; count: number; pct: number }[]
  perfStatus: { scheduled: number; finished: number; canceled: number }
  customerRatio: { users: number; guests: number }
  recentActivity: { month: string; count: number }[]
}

function formatEur(n: number) {
  return n.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

function exportCSV(reservations: AdminReservation[], performances: Performance[]) {
  const perfMap: Record<number, Performance> = {}
  performances.forEach(p => { perfMap[p.id] = p })

  const rows = [
    ['ID', 'Inscenácia', 'Dátum hrania', 'Zákazník', 'Email', 'Stav', 'Vytvorená'],
    ...reservations.map(r => {
      const perf = perfMap[r.performanceId]
      return [
        r.id,
        r.showTitle ?? perf?.show?.title ?? '—',
        r.performanceStart
          ? new Date(r.performanceStart).toLocaleString('sk-SK')
          : perf?.startTime
            ? new Date(perf.startTime).toLocaleString('sk-SK')
            : '—',
        r.customerName ?? '—',
        r.customerEmail ?? '—',
        r.status === 'ACTIVE' ? 'Aktívna' : 'Zrušená',
        new Date(r.createdAt).toLocaleString('sk-SK'),
      ]
    }),
  ]

  const csv = rows.map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rezervacie-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminStatsPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [rawReservations, setRawReservations] = useState<AdminReservation[]>([])
  const [rawPerformances, setRawPerformances] = useState<Performance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      showsApi.getAll(),
      performancesApi.getAll(),
      reservationsApi.getAll(),
      seatsApi.getAll(),
    ]).then(([shows, performances, reservations, seats]) => {
      setRawReservations(reservations)
      setRawPerformances(performances)
      setStats(computeStats(shows, performances, reservations, seats))
    }).catch(() => setError('Nepodarilo sa načítať dáta.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="admin-section">
      <button className="detail-back" onClick={() => navigate('/admin')}>Dashboard</button>
      <div className="admin-page-header">
        <div>
          <div className="section-label">Admin konzola</div>
          <h2 className="section-title">Štatistiky</h2>
        </div>
        {stats && (
          <button className="btn-ghost" onClick={() => exportCSV(rawReservations, rawPerformances)}>
            ↓ Export CSV
          </button>
        )}
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : stats ? (
        <div className="stats-layout">

          {/* KPI row */}
          <div className="stats-kpi-row">
            <KpiCard label="Celkové tržby" value={formatEur(stats.totalRevenue)} sub="z aktívnych rezervácií" accent />
            <KpiCard label="Predané lístky" value={String(stats.soldTickets)} sub="aktívne tickety" />
            <KpiCard label="Priemerná obsadenosť" value={`${stats.avgOccupancy} %`} sub="per hranie" />
            <KpiCard label="Aktívne rezervácie" value={String(stats.activeReservations)} sub={`${stats.canceledReservations} zrušených`} />
          </div>

          <div className="stats-main-grid">
            {/* Top inscenácie */}
            <div className="stats-card">
              <div className="stats-card-title">Top inscenácie</div>
              <div className="stats-card-sub">podľa počtu rezervácií</div>
              {stats.topShows.length === 0 ? (
                <div className="stats-empty">Žiadne dáta</div>
              ) : (
                <div className="stats-bar-list">
                  {stats.topShows.map((item, i) => {
                    const max = stats.topShows[0].reservations
                    const pct = max > 0 ? Math.round((item.reservations / max) * 100) : 0
                    return (
                      <div key={item.show.id} className="stats-bar-item">
                        <div className="stats-bar-meta">
                          <span className="stats-bar-rank">#{i + 1}</span>
                          <span className="stats-bar-name">{item.show.title}</span>
                          <span className="stats-bar-val">{item.reservations} rez.</span>
                        </div>
                        <div className="stats-bar-track">
                          <div className="stats-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="stats-bar-detail">
                          <span>{item.tickets} lístkov</span>
                          <span className="stats-revenue">{formatEur(item.revenue)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Pravý stĺpec */}
            <div className="stats-side-col">

              {/* Žánre */}
              <div className="stats-card">
                <div className="stats-card-title">Žánrové rozloženie</div>
                <div className="stats-card-sub">inscenácie podľa žánru</div>
                <div className="stats-genre-list">
                  {stats.genreBreakdown.map(g => (
                    <div key={g.genre} className="stats-genre-item">
                      <div className="stats-genre-header">
                        <span className="stats-genre-name">{g.genre}</span>
                        <span className="stats-genre-pct">{g.pct} %</span>
                      </div>
                      <div className="stats-bar-track stats-bar-track--sm">
                        <div className="stats-bar-fill stats-bar-fill--gold" style={{ width: `${g.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stav hraní */}
              <div className="stats-card">
                <div className="stats-card-title">Stav hraní</div>
                <div className="stats-donut-row">
                  <DonutSegment label="Plánované" value={stats.perfStatus.scheduled} color="var(--gold)" />
                  <DonutSegment label="Ukončené" value={stats.perfStatus.finished} color="var(--muted)" />
                  <DonutSegment label="Zrušené" value={stats.perfStatus.canceled} color="#e05252" />
                </div>
              </div>

              {/* Zákazníci */}
              <div className="stats-card">
                <div className="stats-card-title">Typ zákazníka</div>
                <div className="stats-card-sub">registrovaní vs. hostia</div>
                {(() => {
                  const total = stats.customerRatio.users + stats.customerRatio.guests
                  const userPct = total > 0 ? Math.round((stats.customerRatio.users / total) * 100) : 0
                  return (
                    <>
                      <div className="stats-split-bar">
                        <div className="stats-split-fill stats-split-fill--gold" style={{ width: `${userPct}%` }} />
                        <div className="stats-split-fill stats-split-fill--muted" style={{ width: `${100 - userPct}%` }} />
                      </div>
                      <div className="stats-split-legend">
                        <span><span className="stats-dot stats-dot--gold" />Registrovaní {stats.customerRatio.users} ({userPct} %)</span>
                        <span><span className="stats-dot stats-dot--muted" />Hostia {stats.customerRatio.guests} ({100 - userPct} %)</span>
                      </div>
                    </>
                  )
                })()}
              </div>

            </div>
          </div>

          {/* Aktivita po mesiacoch */}
          {stats.recentActivity.length > 0 && (
            <div className="stats-card stats-card--wide">
              <div className="stats-card-title">Rezervácie po mesiacoch</div>
              <div className="stats-card-sub">počet nových rezervácií</div>
              <div className="stats-month-chart">
                {(() => {
                  const max = Math.max(...stats.recentActivity.map(m => m.count), 1)
                  return stats.recentActivity.map(m => (
                    <div key={m.month} className="stats-month-col">
                      <span className="stats-month-val">{m.count}</span>
                      <div className="stats-month-bar-wrap">
                        <div className="stats-month-bar" style={{ height: `${Math.round((m.count / max) * 100)}%` }} />
                      </div>
                      <span className="stats-month-label">{m.month}</span>
                    </div>
                  ))
                })()}
              </div>
            </div>
          )}

        </div>
      ) : null}
    </section>
  )
}

function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={`stats-kpi-card${accent ? ' stats-kpi-card--accent' : ''}`}>
      <div className="stats-kpi-label">{label}</div>
      <div className="stats-kpi-value">{value}</div>
      <div className="stats-kpi-sub">{sub}</div>
    </div>
  )
}

function DonutSegment({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="stats-donut-item">
      <div className="stats-donut-val" style={{ color }}>{value}</div>
      <div className="stats-donut-label">{label}</div>
    </div>
  )
}

function computeStats(
  shows: Show[],
  performances: Performance[],
  reservations: AdminReservation[],
  seats: Seat[],
): Stats {
  const activeRes = reservations.filter(r => r.status === 'ACTIVE')
  const canceledRes = reservations.filter(r => r.status === 'CANCELED')

  const perfMap: Record<number, Performance> = {}
  performances.forEach(p => { perfMap[p.id] = p })

  const seatMap: Record<number, Seat> = {}
  seats.forEach(s => { seatMap[s.id] = s })

  // Rátame tržby a lístky len z aktívnych rezervácií k ukončeným predstaveniam
  const finishedActiveReservations = activeRes.filter(r => {
    const perf = perfMap[r.performanceId]
    return perf?.status === 'FINISHED'
  })

  let totalRevenue = 0
  let soldTickets = 0

  finishedActiveReservations.forEach(r => {
    if (r.seatIds && r.seatIds.length > 0) {
      r.seatIds.forEach(sid => {
        const seat = seatMap[sid]
        if (seat) {
          totalRevenue += seat.price
          soldTickets++
        }
      })
    }
  })

  // Počet miest v sále podľa hall.id
  const hallSeatCounts: Record<number, number> = {}
  seats.forEach(s => {
    hallSeatCounts[s.hall.id] = (hallSeatCounts[s.hall.id] ?? 0) + 1
  })

  // Priemerná obsadenosť len pre ukončené predstavenia
  const occupancies: number[] = []

  performances
    .filter(p => p.status === 'FINISHED')
    .forEach(p => {
      const totalSeatsInHall = hallSeatCounts[p.hall.id] ?? 0
      if (totalSeatsInHall === 0) return

      const occupiedSeats = activeRes
        .filter(r => r.performanceId === p.id)
        .reduce((sum, r) => sum + (r.seatIds?.length ?? 0), 0)

      occupancies.push(Math.min(100, Math.round((occupiedSeats / totalSeatsInHall) * 100)))
    })

  const avgOccupancy = occupancies.length > 0
    ? Math.round(occupancies.reduce((a, b) => a + b, 0) / occupancies.length)
    : 0

  // Top shows len z ukončených predstavení
  const showStats: Record<number, { reservations: number; tickets: number; revenue: number }> = {}

  finishedActiveReservations.forEach(r => {
    const perf = perfMap[r.performanceId]
    const showId = perf?.show?.id
    if (!showId) return

    if (!showStats[showId]) {
      showStats[showId] = { reservations: 0, tickets: 0, revenue: 0 }
    }

    showStats[showId].reservations++

    if (r.seatIds) {
      r.seatIds.forEach(sid => {
        showStats[showId].tickets++
        showStats[showId].revenue += seatMap[sid]?.price ?? 0
      })
    }
  })

  const topShows = shows
    .filter(s => showStats[s.id])
    .map(s => ({ show: s, ...showStats[s.id] }))
    .sort((a, b) => b.reservations - a.reservations)
    .slice(0, 5)

  const genreCounts: Record<string, number> = {}
  shows.forEach(s => s.genres.forEach(g => { genreCounts[g] = (genreCounts[g] ?? 0) + 1 }))

  const totalShows = shows.length || 1
  const genreBreakdown = Object.entries(genreCounts)
    .map(([genre, count]) => ({ genre, count, pct: Math.round((count / totalShows) * 100) }))
    .sort((a, b) => b.count - a.count)

  const perfStatus = {
    scheduled: performances.filter(p => p.status === 'SCHEDULED').length,
    finished: performances.filter(p => p.status === 'FINISHED').length,
    canceled: performances.filter(p => p.status === 'CANCELED').length,
  }

  const customerRatio = {
    users: reservations.filter(r => r.userId != null).length,
    guests: reservations.filter(r => r.userId == null).length,
  }

  const monthCounts: Record<string, number> = {}
  reservations.forEach(r => {
    const d = new Date(r.createdAt)
    const key = d.toLocaleString('sk-SK', { month: 'short', year: '2-digit' })
    monthCounts[key] = (monthCounts[key] ?? 0) + 1
  })

  const recentActivity = Object.entries(monthCounts)
    .map(([month, count]) => ({ month, count }))
    .slice(-6)

  return {
    totalRevenue,
    soldTickets,
    avgOccupancy,
    activeReservations: activeRes.length,
    canceledReservations: canceledRes.length,
    topShows,
    genreBreakdown,
    perfStatus,
    customerRatio,
    recentActivity,
  }
}
