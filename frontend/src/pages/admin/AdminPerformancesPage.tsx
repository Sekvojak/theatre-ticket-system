import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { performancesApi, showsApi, hallsApi } from '../../api/api'
import type { Performance, Show, Hall, PerformanceStatus } from '../../api/types'

const STATUSES: PerformanceStatus[] = ['SCHEDULED', 'CANCELED', 'FINISHED']
const STATUS_LABELS: Record<PerformanceStatus, string> = {
  SCHEDULED: 'Plánované',
  CANCELED: 'Zrušené',
  FINISHED: 'Ukončené',
}

const EMPTY_FORM = { showId: '', hallId: '', startTime: '', status: 'SCHEDULED' as PerformanceStatus }

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminPerformancesPage() {
  const navigate = useNavigate()
  const [performances, setPerformances] = useState<Performance[]>([])
  const [shows, setShows] = useState<Show[]>([])
  const [halls, setHalls] = useState<Hall[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Performance | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const load = () =>
    Promise.all([performancesApi.getAll(), showsApi.getAll(), hallsApi.getAll()])
      .then(([perfs, s, h]) => { setPerformances(perfs); setShows(s); setHalls(h) })
      .catch(() => setError('Nepodarilo sa načítať dáta.'))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (p: Performance) => {
    setEditing(p)
    // Convert ISO to local datetime-local format
    const dt = new Date(p.startTime)
    const pad = (n: number) => String(n).padStart(2, '0')
    const local = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
    setForm({ showId: String(p.show.id), hallId: String(p.hall.id), startTime: local, status: p.status })
    setFormError('')
    setModalOpen(true)
  }

  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const handleSave = async () => {
    if (!form.showId || !form.hallId || !form.startTime) {
      setFormError('Vyplň všetky povinné polia.')
      return
    }
    setSaving(true)
    setFormError('')
    const payload = {
      show: { id: parseInt(form.showId) },
      hall: { id: parseInt(form.hallId) },
      startTime: new Date(form.startTime).toISOString(),
      status: form.status,
    }
    try {
      if (editing) {
        const updated = await performancesApi.update(editing.id, payload)
        setPerformances(ps => ps.map(x => x.id === editing.id ? updated : x))
      } else {
        const created = await performancesApi.create(payload)
        setPerformances(ps => [...ps, created])
      }
      closeModal()
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Nastala chyba.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await performancesApi.delete(id)
      setPerformances(ps => ps.filter(x => x.id !== id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Nepodarilo sa zmazať.')
    }
    setDeleteConfirm(null)
  }

  return (
    <section className="admin-section">
      <button className="detail-back" onClick={() => navigate('/admin')}>Dashboard</button>
      <div className="admin-page-header">
        <div>
          <div className="section-label">Admin konzola</div>
          <h2 className="section-title">Hrania</h2>
        </div>
        <button className="btn-gold" onClick={openCreate}>+ Nové hranie</button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : performances.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗓️</div>
          <h3>Žiadne hrania</h3>
          <p>Naplánuj prvé hranie pomocou tlačidla vyššie.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Inscenácia</th>
                <th>Sála</th>
                <th>Dátum a čas</th>
                <th>Stav</th>
                <th>Akcie</th>
              </tr>
            </thead>
            <tbody>
              {performances.map(p => (
                <tr key={p.id}>
                  <td className="admin-td-id">{p.id}</td>
                  <td className="admin-td-main">{p.show.title}</td>
                  <td>{p.hall.name}</td>
                  <td>{formatDateTime(p.startTime)}</td>
                  <td>
                    <span className={`perf-status ${p.status.toLowerCase()}`}>
                      {STATUS_LABELS[p.status] ?? p.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-btn-edit" onClick={() => openEdit(p)}>Upraviť</button>
                      {deleteConfirm === p.id ? (
                        <>
                          <button className="admin-btn-confirm-del" onClick={() => handleDelete(p.id)}>Potvrdiť</button>
                          <button className="admin-btn-cancel-del" onClick={() => setDeleteConfirm(null)}>Zrušiť</button>
                        </>
                      ) : (
                        <button className="admin-btn-delete" onClick={() => setDeleteConfirm(p.id)}>Zmazať</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal admin-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <span className="modal-logo">Klára</span>
            <h2>{editing ? 'Upraviť hranie' : 'Nové hranie'}</h2>
            <p className="modal-sub">Nastav termín a miesto hrania</p>

            {formError && <div className="error-msg">{formError}</div>}

            <div className="form-group">
              <label>Inscenácia *</label>
              <select className="admin-select" value={form.showId} onChange={e => setForm(f => ({ ...f, showId: e.target.value }))}>
                <option value="">— Vyber inscenáciu —</option>
                {shows.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Sála *</label>
              <select className="admin-select" value={form.hallId} onChange={e => setForm(f => ({ ...f, hallId: e.target.value }))}>
                <option value="">— Vyber sálu —</option>
                {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Dátum a čas *</label>
              <input type="datetime-local" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Stav</label>
              <select className="admin-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as PerformanceStatus }))}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>

            <button className="btn-form" onClick={handleSave} disabled={saving}>
              {saving ? 'Ukladám...' : editing ? 'Uložiť zmeny' : 'Vytvoriť'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
