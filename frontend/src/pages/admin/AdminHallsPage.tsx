import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hallsApi, seatsApi } from '../../api/api'
import type { Hall, Seat } from '../../api/types'

const EMPTY_HALL_FORM = { name: '', capacity: '' }
const EMPTY_SEAT_FORM = { rowNumber: '', seatNumber: '', price: '' }
const EMPTY_BULK_FORM = { rowFrom: '', rowTo: '', seatFrom: '', seatTo: '', price: '' }

export default function AdminHallsPage() {
  const navigate = useNavigate()
  const [halls, setHalls] = useState<Hall[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Hall modal
  const [hallModal, setHallModal] = useState(false)
  const [editingHall, setEditingHall] = useState<Hall | null>(null)
  const [hallForm, setHallForm] = useState(EMPTY_HALL_FORM)
  const [hallSaving, setHallSaving] = useState(false)
  const [hallFormError, setHallFormError] = useState('')
  const [deleteHallConfirm, setDeleteHallConfirm] = useState<number | null>(null)

  // Expanded hall (seats panel)
  const [expandedHallId, setExpandedHallId] = useState<number | null>(null)
  const [seats, setSeats] = useState<Record<number, Seat[]>>({})
  const [seatsLoading, setSeatsLoading] = useState<number | null>(null)

  // Seat modal
  const [seatModal, setSeatModal] = useState(false)
  const [editingSeat, setEditingSeat] = useState<Seat | null>(null)
  const [seatForm, setSeatForm] = useState(EMPTY_SEAT_FORM)
  const [currentHallId, setCurrentHallId] = useState<number | null>(null)
  const [seatSaving, setSeatSaving] = useState(false)
  const [seatFormError, setSeatFormError] = useState('')
  const [deleteSeatConfirm, setDeleteSeatConfirm] = useState<number | null>(null)

  // Bulk seat modal
  const [bulkModal, setBulkModal] = useState(false)
  const [bulkHallId, setBulkHallId] = useState<number | null>(null)
  const [bulkForm, setBulkForm] = useState(EMPTY_BULK_FORM)
  const [bulkSaving, setBulkSaving] = useState(false)
  const [bulkError, setBulkError] = useState('')
  const [bulkProgress, setBulkProgress] = useState(0)

  const load = () =>
    hallsApi.getAll()
      .then(setHalls)
      .catch(() => setError('Nepodarilo sa načítať sály.'))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const toggleExpand = async (hallId: number) => {
    if (expandedHallId === hallId) {
      setExpandedHallId(null)
      return
    }
    setExpandedHallId(hallId)
    if (!seats[hallId]) {
      setSeatsLoading(hallId)
      try {
        const s = await seatsApi.getByHall(hallId)
        setSeats(prev => ({ ...prev, [hallId]: s }))
      } catch {
        setError('Nepodarilo sa načítať sedadlá.')
      } finally {
        setSeatsLoading(null)
      }
    }
  }

  // Hall CRUD
  const openCreateHall = () => {
    setEditingHall(null)
    setHallForm(EMPTY_HALL_FORM)
    setHallFormError('')
    setHallModal(true)
  }

  const openEditHall = (hall: Hall) => {
    setEditingHall(hall)
    setHallForm({ name: hall.name, capacity: String(hall.capacity) })
    setHallFormError('')
    setHallModal(true)
  }

  const handleSaveHall = async () => {
    if (!hallForm.name.trim() || !hallForm.capacity) {
      setHallFormError('Vyplň všetky povinné polia.')
      return
    }
    setHallSaving(true)
    setHallFormError('')
    const payload = { name: hallForm.name.trim(), capacity: parseInt(hallForm.capacity) }
    try {
      if (editingHall) {
        const updated = await hallsApi.update(editingHall.id, payload)
        setHalls(hs => hs.map(h => h.id === editingHall.id ? updated : h))
      } else {
        const created = await hallsApi.create(payload)
        setHalls(hs => [...hs, created])
      }
      setHallModal(false)
      setEditingHall(null)
    } catch (e: unknown) {
      setHallFormError(e instanceof Error ? e.message : 'Nastala chyba.')
    } finally {
      setHallSaving(false)
    }
  }

  const handleDeleteHall = async (id: number) => {
    try {
      await hallsApi.delete(id)
      setHalls(hs => hs.filter(h => h.id !== id))
      if (expandedHallId === id) setExpandedHallId(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Nepodarilo sa zmazať sálu.')
    }
    setDeleteHallConfirm(null)
  }

  // Seat CRUD
  const openCreateSeat = (hallId: number) => {
    setEditingSeat(null)
    setSeatForm(EMPTY_SEAT_FORM)
    setSeatFormError('')
    setCurrentHallId(hallId)
    setSeatModal(true)
  }

  const openEditSeat = (seat: Seat) => {
    setEditingSeat(seat)
    setSeatForm({ rowNumber: String(seat.rowNumber), seatNumber: String(seat.seatNumber), price: String(seat.price) })
    setSeatFormError('')
    setCurrentHallId(seat.hall.id)
    setSeatModal(true)
  }

  const handleSaveSeat = async () => {
    if (!seatForm.rowNumber || !seatForm.seatNumber || !seatForm.price || !currentHallId) {
      setSeatFormError('Vyplň všetky povinné polia.')
      return
    }
    setSeatSaving(true)
    setSeatFormError('')
    try {
      if (editingSeat) {
        const updated = await seatsApi.update(editingSeat.id, {
          rowNumber: parseInt(seatForm.rowNumber),
          seatNumber: parseInt(seatForm.seatNumber),
          price: parseFloat(seatForm.price),
        })
        setSeats(prev => ({
          ...prev,
          [currentHallId]: prev[currentHallId].map(s => s.id === editingSeat.id ? updated : s),
        }))
      } else {
        const created = await seatsApi.create({
          rowNumber: parseInt(seatForm.rowNumber),
          seatNumber: parseInt(seatForm.seatNumber),
          price: parseFloat(seatForm.price),
          hall: { id: currentHallId },
        })
        setSeats(prev => ({
          ...prev,
          [currentHallId]: [...(prev[currentHallId] ?? []), created],
        }))
      }
      setSeatModal(false)
      setEditingSeat(null)
    } catch (e: unknown) {
      setSeatFormError(e instanceof Error ? e.message : 'Nastala chyba.')
    } finally {
      setSeatSaving(false)
    }
  }

  const handleDeleteSeat = async (seat: Seat) => {
    try {
      await seatsApi.delete(seat.id)
      setSeats(prev => ({
        ...prev,
        [seat.hall.id]: prev[seat.hall.id].filter(s => s.id !== seat.id),
      }))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Nepodarilo sa zmazať sedadlo.')
    }
    setDeleteSeatConfirm(null)
  }

  // Bulk seat generation
  const openBulkModal = (hallId: number) => {
    setBulkHallId(hallId)
    setBulkForm(EMPTY_BULK_FORM)
    setBulkError('')
    setBulkProgress(0)
    setBulkModal(true)
  }

  const getBulkStats = () => {
    if (!bulkHallId) return { count: 0, existing: 0, remaining: 0 }
    const r1 = parseInt(bulkForm.rowFrom), r2 = parseInt(bulkForm.rowTo)
    const s1 = parseInt(bulkForm.seatFrom), s2 = parseInt(bulkForm.seatTo)
    const hall = halls.find(h => h.id === bulkHallId)
    const existing = seats[bulkHallId]?.length ?? 0
    const remaining = (hall?.capacity ?? 0) - existing
    const count = (!isNaN(r1) && !isNaN(r2) && !isNaN(s1) && !isNaN(s2) && r2 >= r1 && s2 >= s1)
      ? (r2 - r1 + 1) * (s2 - s1 + 1)
      : 0
    return { count, existing, remaining }
  }

  const handleBulkGenerate = async () => {
    if (!bulkHallId) return
    const r1 = parseInt(bulkForm.rowFrom), r2 = parseInt(bulkForm.rowTo)
    const s1 = parseInt(bulkForm.seatFrom), s2 = parseInt(bulkForm.seatTo)
    const price = parseFloat(bulkForm.price)
    if (isNaN(r1) || isNaN(r2) || isNaN(s1) || isNaN(s2) || isNaN(price)) {
      setBulkError('Vyplň všetky polia správnymi číslami.')
      return
    }
    if (r2 < r1 || s2 < s1) {
      setBulkError('Koncová hodnota musí byť väčšia alebo rovnaká ako začiatočná.')
      return
    }
    if (price <= 0) {
      setBulkError('Cena musí byť väčšia ako 0.')
      return
    }
    const { count, remaining } = getBulkStats()
    if (count > remaining) {
      setBulkError(`Kapacita sály by bola prekročená. Môžeš pridať najviac ${remaining} sedadiel.`)
      return
    }
    setBulkSaving(true)
    setBulkError('')
    setBulkProgress(0)
    const created: Seat[] = []
    let done = 0
    const total = count
    try {
      for (let row = r1; row <= r2; row++) {
        for (let seat = s1; seat <= s2; seat++) {
          const s = await seatsApi.create({ rowNumber: row, seatNumber: seat, price, hall: { id: bulkHallId } })
          created.push(s)
          done++
          setBulkProgress(Math.round((done / total) * 100))
        }
      }
      setSeats(prev => ({
        ...prev,
        [bulkHallId]: [...(prev[bulkHallId] ?? []), ...created],
      }))
      setBulkModal(false)
    } catch (e: unknown) {
      setBulkError(e instanceof Error ? e.message : 'Nastala chyba pri generovaní.')
    } finally {
      setBulkSaving(false)
    }
  }

  return (
    <section className="admin-section">
      <button className="detail-back" onClick={() => navigate('/admin')}>Dashboard</button>
      <div className="admin-page-header">
        <div>
          <div className="section-label">Admin konzola</div>
          <h2 className="section-title">Sály</h2>
        </div>
        <button className="btn-gold" onClick={openCreateHall}>+ Nová sála</button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : halls.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏛️</div>
          <h3>Žiadne sály</h3>
          <p>Pridaj prvú sálu pomocou tlačidla vyššie.</p>
        </div>
      ) : (
        <div className="admin-halls-list">
          {halls.map(hall => (
            <div key={hall.id} className="admin-hall-item">
              <div className="admin-hall-row">
                <button className="admin-hall-expand" onClick={() => toggleExpand(hall.id)}>
                  <span className={`admin-hall-chevron${expandedHallId === hall.id ? ' open' : ''}`}>▶</span>
                  <div className="admin-hall-info">
                    <span className="admin-hall-name">{hall.name}</span>
                    <span className="admin-hall-cap">{hall.capacity} miest</span>
                  </div>
                </button>
                <div className="admin-actions">
                  <button className="admin-btn-edit" onClick={() => openEditHall(hall)}>Upraviť</button>
                  {deleteHallConfirm === hall.id ? (
                    <>
                      <button className="admin-btn-confirm-del" onClick={() => handleDeleteHall(hall.id)}>Potvrdiť</button>
                      <button className="admin-btn-cancel-del" onClick={() => setDeleteHallConfirm(null)}>Zrušiť</button>
                    </>
                  ) : (
                    <button className="admin-btn-delete" onClick={() => setDeleteHallConfirm(hall.id)}>Zmazať</button>
                  )}
                </div>
              </div>

              {expandedHallId === hall.id && (
                <div className="admin-seats-panel">
                  <div className="admin-seats-header">
                    <span className="admin-seats-label">
                      Sedadlá v sále
                      {seats[hall.id] && (
                        <span className="admin-seats-quota">
                          {seats[hall.id].length} / {hall.capacity}
                          {seats[hall.id].length >= hall.capacity && <span className="admin-seats-full"> — plná kapacita</span>}
                        </span>
                      )}
                    </span>
                    <div className="admin-actions">
                      <button className="admin-btn-edit" onClick={() => openBulkModal(hall.id)}>⚡ Hromadné pridanie</button>
                      <button className="admin-btn-edit" onClick={() => openCreateSeat(hall.id)}>+ Pridať sedadlo</button>
                    </div>
                  </div>
                  {seatsLoading === hall.id ? (
                    <div className="loading-wrap"><div className="spinner" /></div>
                  ) : !seats[hall.id] || seats[hall.id].length === 0 ? (
                    <div className="admin-seats-empty">Žiadne sedadlá. Pridaj ich pomocou tlačidla vyššie.</div>
                  ) : (
                    <table className="admin-table admin-table-sm">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Rad</th>
                          <th>Sedadlo</th>
                          <th>Cena (€)</th>
                          <th>Akcie</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seats[hall.id].sort((a, b) => a.rowNumber - b.rowNumber || a.seatNumber - b.seatNumber).map(seat => (
                          <tr key={seat.id}>
                            <td className="admin-td-id">{seat.id}</td>
                            <td>{seat.rowNumber}</td>
                            <td>{seat.seatNumber}</td>
                            <td>{seat.price.toFixed(2)} €</td>
                            <td>
                              <div className="admin-actions">
                                <button className="admin-btn-edit" onClick={() => openEditSeat(seat)}>Upraviť</button>
                                {deleteSeatConfirm === seat.id ? (
                                  <>
                                    <button className="admin-btn-confirm-del" onClick={() => handleDeleteSeat(seat)}>Potvrdiť</button>
                                    <button className="admin-btn-cancel-del" onClick={() => setDeleteSeatConfirm(null)}>Zrušiť</button>
                                  </>
                                ) : (
                                  <button className="admin-btn-delete" onClick={() => setDeleteSeatConfirm(seat.id)}>Zmazať</button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Hall Modal */}
      {hallModal && (
        <div className="modal-overlay" onClick={() => setHallModal(false)}>
          <div className="modal admin-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setHallModal(false)}>×</button>
            <span className="modal-logo">Klára</span>
            <h2>{editingHall ? 'Upraviť sálu' : 'Nová sála'}</h2>
            <p className="modal-sub">Zadaj údaje o sále</p>
            {hallFormError && <div className="error-msg">{hallFormError}</div>}
            <div className="form-group">
              <label>Názov *</label>
              <input value={hallForm.name} onChange={e => setHallForm(f => ({ ...f, name: e.target.value }))} placeholder="Veľká sála" />
            </div>
            <div className="form-group">
              <label>Kapacita (počet miest) *</label>
              <input type="number" min="1" value={hallForm.capacity} onChange={e => setHallForm(f => ({ ...f, capacity: e.target.value }))} placeholder="200" />
            </div>
            <button className="btn-form" onClick={handleSaveHall} disabled={hallSaving}>
              {hallSaving ? 'Ukladám...' : editingHall ? 'Uložiť zmeny' : 'Vytvoriť'}
            </button>
          </div>
        </div>
      )}

      {/* Bulk Seat Modal */}
      {bulkModal && bulkHallId && (() => {
        const hall = halls.find(h => h.id === bulkHallId)
        const { count, existing, remaining } = getBulkStats()
        const overLimit = count > remaining
        return (
          <div className="modal-overlay" onClick={() => !bulkSaving && setBulkModal(false)}>
            <div className="modal admin-modal" onClick={e => e.stopPropagation()}>
              {!bulkSaving && <button className="modal-close" onClick={() => setBulkModal(false)}>×</button>}
              <span className="modal-logo">Klára</span>
              <h2>Hromadné pridanie sedadiel</h2>
              <p className="modal-sub">{hall?.name} — kapacita: {hall?.capacity}, obsadené: {existing}, voľné: {remaining}</p>

              {bulkError && <div className="error-msg">{bulkError}</div>}

              <div className="bulk-range-grid">
                <div className="form-group">
                  <label>Rad od *</label>
                  <input type="number" min="1" value={bulkForm.rowFrom} onChange={e => setBulkForm(f => ({ ...f, rowFrom: e.target.value }))} placeholder="1" disabled={bulkSaving} />
                </div>
                <div className="form-group">
                  <label>Rad do *</label>
                  <input type="number" min="1" value={bulkForm.rowTo} onChange={e => setBulkForm(f => ({ ...f, rowTo: e.target.value }))} placeholder="10" disabled={bulkSaving} />
                </div>
                <div className="form-group">
                  <label>Sedadlo od *</label>
                  <input type="number" min="1" value={bulkForm.seatFrom} onChange={e => setBulkForm(f => ({ ...f, seatFrom: e.target.value }))} placeholder="1" disabled={bulkSaving} />
                </div>
                <div className="form-group">
                  <label>Sedadlo do *</label>
                  <input type="number" min="1" value={bulkForm.seatTo} onChange={e => setBulkForm(f => ({ ...f, seatTo: e.target.value }))} placeholder="15" disabled={bulkSaving} />
                </div>
              </div>
              <div className="form-group">
                <label>Cena za sedadlo (€) *</label>
                <input type="number" min="0.5" step="0.5" value={bulkForm.price} onChange={e => setBulkForm(f => ({ ...f, price: e.target.value }))} placeholder="15.00" disabled={bulkSaving} />
              </div>

              {count > 0 && (
                <div className={`bulk-preview${overLimit ? ' bulk-preview--error' : ''}`}>
                  <span className="bulk-preview-formula">
                    {parseInt(bulkForm.rowTo) - parseInt(bulkForm.rowFrom) + 1} radov × {parseInt(bulkForm.seatTo) - parseInt(bulkForm.seatFrom) + 1} sedadiel
                  </span>
                  <span className="bulk-preview-total">
                    = <strong>{count}</strong> sedadiel
                    {overLimit
                      ? <span className="bulk-preview-warn"> — prekračuje kapacitu o {count - remaining}!</span>
                      : <span className="bulk-preview-ok"> — zostatok: {remaining - count}</span>
                    }
                  </span>
                </div>
              )}

              {bulkSaving && (
                <div className="bulk-progress-wrap">
                  <div className="bulk-progress-bar">
                    <div className="bulk-progress-fill" style={{ width: `${bulkProgress}%` }} />
                  </div>
                  <span className="bulk-progress-label">{bulkProgress}% — generujem sedadlá...</span>
                </div>
              )}

              <button className="btn-form" onClick={handleBulkGenerate} disabled={bulkSaving || count === 0 || overLimit}>
                {bulkSaving ? `Generujem... (${bulkProgress}%)` : `Vytvoriť ${count > 0 ? count : ''} sedadiel`}
              </button>
            </div>
          </div>
        )
      })()}

      {/* Seat Modal */}
      {seatModal && (
        <div className="modal-overlay" onClick={() => setSeatModal(false)}>
          <div className="modal admin-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSeatModal(false)}>×</button>
            <span className="modal-logo">Klára</span>
            <h2>{editingSeat ? 'Upraviť sedadlo' : 'Nové sedadlo'}</h2>
            <p className="modal-sub">Zadaj parametre sedadla</p>
            {seatFormError && <div className="error-msg">{seatFormError}</div>}
            <div className="form-group">
              <label>Rad *</label>
              <input type="number" min="1" value={seatForm.rowNumber} onChange={e => setSeatForm(f => ({ ...f, rowNumber: e.target.value }))} placeholder="1" />
            </div>
            <div className="form-group">
              <label>Číslo sedadla *</label>
              <input type="number" min="1" value={seatForm.seatNumber} onChange={e => setSeatForm(f => ({ ...f, seatNumber: e.target.value }))} placeholder="1" />
            </div>
            <div className="form-group">
              <label>Cena (€) *</label>
              <input type="number" min="0" step="0.5" value={seatForm.price} onChange={e => setSeatForm(f => ({ ...f, price: e.target.value }))} placeholder="15.00" />
            </div>
            <button className="btn-form" onClick={handleSaveSeat} disabled={seatSaving}>
              {seatSaving ? 'Ukladám...' : editingSeat ? 'Uložiť zmeny' : 'Vytvoriť'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
