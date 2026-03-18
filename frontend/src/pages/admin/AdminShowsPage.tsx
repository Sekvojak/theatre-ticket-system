import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { showsApi } from '../../api/api'
import type { Show } from '../../api/types'

const EMPTY_FORM = { title: '', description: '', durationMinutes: '' }
const ALL_GENRES = ['Dráma', 'Komédia', 'Muzikál', 'Tragédia', 'Opera', 'Balet', 'Činohra', 'Pre deti']

export default function AdminShowsPage() {
  const navigate = useNavigate()
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Show | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const load = () =>
    showsApi.getAll()
      .then(setShows)
      .catch(() => setError('Nepodarilo sa načítať inscenácie.'))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const toggleGenre = (g: string) =>
    setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setSelectedGenres([])
    setImageUrl(null)
    setImageFile(null)
    setImagePreview(null)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (show: Show) => {
    setEditing(show)
    setForm({
      title: show.title,
      description: show.description ?? '',
      durationMinutes: String(show.durationMinutes),
    })
    setSelectedGenres(show.genres)
    setImageUrl(show.imageUrl ?? null)
    setImageFile(null)
    setImagePreview(show.imageUrl ?? null)
    setFormError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    setImageFile(null)
    setImagePreview(null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!form.title.trim() || selectedGenres.length === 0 || !form.durationMinutes) {
      setFormError('Vyplň všetky povinné polia a vyber aspoň jeden žáner.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      let finalImageUrl = imageUrl ?? null
      if (imageFile) {
        setUploadingImage(true)
        const res = await showsApi.uploadImage(imageFile)
        finalImageUrl = res.url
        setUploadingImage(false)
      }
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        genres: selectedGenres,
        durationMinutes: parseInt(form.durationMinutes),
        imageUrl: finalImageUrl,
      }
      if (editing) {
        const updated = await showsApi.update(editing.id, payload as Omit<Show, 'id'>)
        setShows(s => s.map(x => x.id === editing.id ? updated : x))
      } else {
        const created = await showsApi.create(payload as Omit<Show, 'id'>)
        setShows(s => [...s, created])
      }
      closeModal()
    } catch (e: unknown) {
      setUploadingImage(false)
      setFormError(e instanceof Error ? e.message : 'Nastala chyba.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await showsApi.delete(id)
      setShows(s => s.filter(x => x.id !== id))
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
          <h2 className="section-title">Inscenácie</h2>
        </div>
        <button className="btn-gold" onClick={openCreate}>+ Nová inscenácia</button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : shows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎭</div>
          <h3>Žiadne inscenácie</h3>
          <p>Pridaj prvú inscenáciu pomocou tlačidla vyššie.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Plagát</th>
                <th>Názov</th>
                <th>Žáner</th>
                <th>Dĺžka (min)</th>
                <th>Popis</th>
                <th>Akcie</th>
              </tr>
            </thead>
            <tbody>
              {shows.map(show => (
                <tr key={show.id}>
                  <td className="admin-td-id">{show.id}</td>
                  <td>
                    {show.imageUrl
                      ? <img src={show.imageUrl} alt={show.title} className="admin-poster-thumb" />
                      : <span className="admin-poster-placeholder">—</span>
                    }
                  </td>
                  <td className="admin-td-main">{show.title}</td>
                  <td>{show.genres.map(g => <span key={g} className="admin-badge" style={{ marginRight: 4 }}>{g}</span>)}</td>
                  <td>{show.durationMinutes}'</td>
                  <td className="admin-td-desc">{show.description ?? '—'}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-btn-edit" onClick={() => openEdit(show)}>Upraviť</button>
                      {deleteConfirm === show.id ? (
                        <>
                          <button className="admin-btn-confirm-del" onClick={() => handleDelete(show.id)}>Potvrdiť</button>
                          <button className="admin-btn-cancel-del" onClick={() => setDeleteConfirm(null)}>Zrušiť</button>
                        </>
                      ) : (
                        <button className="admin-btn-delete" onClick={() => setDeleteConfirm(show.id)}>Zmazať</button>
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
            <h2>{editing ? 'Upraviť inscenáciu' : 'Nová inscenácia'}</h2>
            <p className="modal-sub">Vyplň údaje o inscenácii</p>

            {formError && <div className="error-msg">{formError}</div>}

            <div className="form-group">
              <label>Názov *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Hamlet" />
            </div>
            <div className="form-group">
              <label>Žánre * <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(vyber aspoň jeden)</span></label>
              <div className="admin-genre-checkboxes">
                {ALL_GENRES.map(g => (
                  <label key={g} className={`admin-genre-chip${selectedGenres.includes(g) ? ' selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(g)}
                      onChange={() => toggleGenre(g)}
                    />
                    {g}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Dĺžka (minúty) *</label>
              <input type="number" min="1" value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))} placeholder="120" />
            </div>
            <div className="form-group">
              <label>Popis</label>
              <textarea
                className="admin-textarea"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Krátky popis inscenácie..."
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Plagát / banner (voliteľné)</label>
              {imagePreview && (
                <div className="admin-image-preview">
                  <img src={imagePreview} alt="Náhľad" />
                  <button
                    type="button"
                    className="admin-image-remove"
                    onClick={() => { setImagePreview(null); setImageFile(null); setImageUrl(null) }}
                  >
                    ✕ Odstrániť
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="admin-file-input"
              />
              <p className="admin-file-hint">
                {imagePreview ? 'Nahrať inú fotku' : 'Ak nevyberiete fotku, použije sa predvolený poster.'} JPG, PNG, WEBP
              </p>
            </div>

            <button className="btn-form" onClick={handleSave} disabled={saving || uploadingImage}>
              {uploadingImage ? 'Nahrávam obrázok...' : saving ? 'Ukladám...' : editing ? 'Uložiť zmeny' : 'Vytvoriť'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
