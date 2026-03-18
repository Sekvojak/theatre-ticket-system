import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { showsApi, performancesApi, hallsApi, reservationsApi } from '../../api/api'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [counts, setCounts] = useState({ shows: 0, performances: 0, halls: 0, reservations: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      showsApi.getAll(),
      performancesApi.getAll(),
      hallsApi.getAll(),
      reservationsApi.getAll(),
    ]).then(([shows, performances, halls, reservations]) => {
      setCounts({
        shows: shows.length,
        performances: performances.length,
        halls: halls.length,
        reservations: reservations.length,
      })
    }).finally(() => setLoading(false))
  }, [])

  const sections = [
    {
      label: 'Inscenácie',
      count: counts.shows,
      desc: 'Spravuj divadelné a filmové inscenácie',
      path: '/admin/shows',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 6h4l3-3 4 6 3-4 2 4h4" />
          <rect x="2" y="14" width="20" height="6" rx="1" />
        </svg>
      ),
    },
    {
      label: 'Hrania',
      count: counts.performances,
      desc: 'Plánuj termíny a správaj hrania',
      path: '/admin/performances',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <circle cx="12" cy="16" r="2" />
        </svg>
      ),
    },
    {
      label: 'Sály',
      count: counts.halls,
      desc: 'Sály a ich rozmiestnenie sedadiel',
      path: '/admin/halls',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: 'Rezervácie',
      count: counts.reservations,
      desc: 'Prehľad všetkých rezervácií',
      path: '/admin/reservations',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="13" y2="17" />
        </svg>
      ),
    },
    {
      label: 'Štatistiky',
      count: null,
      desc: 'Tržby, obsadenosť, export CSV',
      path: '/admin/stats',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
  ]

  return (
    <section className="admin-section">
      <div className="admin-page-header">
        <div>
          <div className="section-label">Admin konzola</div>
          <h2 className="section-title">Dashboard</h2>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : (
        <div className="admin-dashboard-grid">
          {sections.map(s => (
            <button key={s.path} className="admin-dashboard-card" onClick={() => navigate(s.path)}>
              <div className="admin-dashboard-icon">{s.icon}</div>
              <div className="admin-dashboard-count">{s.count ?? '—'}</div>
              <div className="admin-dashboard-label">{s.label}</div>
              <div className="admin-dashboard-desc">{s.desc}</div>
              <div className="admin-dashboard-arrow">→</div>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
