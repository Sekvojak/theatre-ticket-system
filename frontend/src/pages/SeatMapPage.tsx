import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { performancesApi, seatsApi, reservationsApi } from '../api/api'
import type { Performance, Show, SeatAvailability, Seat, CreateReservationRequest } from '../api/types'
import { useApp } from '../context/AppContext'
import { formatDate, formatTime, rowToLetter } from '../utils'

type BookingStep = 'seats' | 'form' | 'success'

interface LocationState {
  performance?: Performance
  show?: Show
}

export default function SeatMapPage() {
  const { performanceId } = useParams<{ performanceId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, setCartCount } = useApp()

  const state = location.state as LocationState | null
  const [performance, setPerformance] = useState<Performance | null>(state?.performance ?? null)

  const [seatMap, setSeatMap] = useState<SeatAvailability[]>([])
  const [hallSeats, setHallSeats] = useState<Seat[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [step, setStep] = useState<BookingStep>('seats')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [reservationId, setReservationId] = useState<number | null>(null)
  const [reservationEmail, setReservationEmail] = useState('')

  useEffect(() => {
    if (!performanceId) return
    const id = parseInt(performanceId)

    const fetchData = async () => {
      try {
        // Fetch seat availability map
        const map = await performancesApi.getSeatMap(id)
        setSeatMap(map)

        // If performance not in state, find from all performances
        // TODO: Backend should have GET /api/performances/{id}
        let perf = performance
        if (!perf) {
          const allPerfs = await performancesApi.getAll()
          perf = allPerfs.find(p => p.id === id) ?? null
          if (perf) setPerformance(perf)
        }

        // Fetch seat prices for the hall
        if (perf?.hall?.id) {
          const seats = await seatsApi.getByHall(perf.hall.id)
          setHallSeats(seats)
        }
      } catch {
        setError('Nepodarilo sa načítať mapu sedadiel.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [performanceId])

  // Sync cart badge with selected seats count
  useEffect(() => {
    setCartCount(selectedIds.size)
    return () => setCartCount(0) // cleanup on unmount
  }, [selectedIds.size])

  const priceMap = new Map<number, number>(hallSeats.map(s => [s.id, s.price]))

  function getSeatPrice(seatId: number): number {
    return priceMap.get(seatId) ?? 0
  }

  const subtotal = Array.from(selectedIds).reduce((sum, id) => sum + getSeatPrice(id), 0)
  const fee = selectedIds.size > 0 ? 1 : 0
  const total = subtotal + fee

  function toggleSeat(seatId: number) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(seatId)) next.delete(seatId)
      else next.add(seatId)
      return next
    })
  }

  // Group seats by row
  const rows = Array.from(
    seatMap.reduce((map, seat) => {
      if (!map.has(seat.rowNumber)) map.set(seat.rowNumber, [])
      map.get(seat.rowNumber)!.push(seat)
      return map
    }, new Map<number, SeatAvailability[]>())
  ).sort(([a], [b]) => a - b)

  const handleContinue = () => {
    if (selectedIds.size === 0) return
    setStep('form')
  }

  const handleSubmitReservation = async () => {
    if (!performance) return
    if (!user && (!guestName.trim() || !guestEmail.trim())) {
      setError('Prosím vyplňte meno a e-mail.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const req: CreateReservationRequest = {
        performanceId: performance.id,
        seatIds: Array.from(selectedIds),
        ...(user
          ? { userId: user.id }
          : { guestName: guestName.trim(), guestEmail: guestEmail.trim() }
        ),
      }
      const res = await reservationsApi.create(req)
      setReservationId(res.id)
      setReservationEmail(res.guestEmail ?? user?.email ?? '')
      setCartCount(0)
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rezervácia zlyhala. Skúste znova.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <section className="seatmap-section">
        <div className="loading-wrap"><div className="spinner" /></div>
      </section>
    )
  }

  if (error && seatMap.length === 0) {
    return (
      <section className="seatmap-section">
        <button className="detail-back" onClick={() => navigate('/shows')}>Späť na predstavenia</button>
        <div className="error-msg">{error}</div>
      </section>
    )
  }

  return (
    <section className="seatmap-section">
      <button className="detail-back" onClick={() => navigate('/shows')}>
        Späť na predstavenia
      </button>
      <div className="section-label">Výber sedadiel</div>
      <h2 className="section-title">
        {performance ? `Mapa sály – ${performance.show.title}` : 'Mapa sály'}
      </h2>

      <div className="seatmap-wrapper">
        {/* LEFT: Seat grid */}
        <div className="stage-area">
          <div className="stage-label">🎭 &nbsp; Javisko &nbsp; 🎭</div>

          <div className="seat-grid">
            {rows.map(([rowNum, seats]) => {
              const isVip = rowNum <= 2
              const sortedSeats = seats.sort((a, b) => a.seatNumber - b.seatNumber)
              return (
                <div key={rowNum} className="seat-row">
                  <div className="row-label">{rowToLetter(rowNum)}</div>
                  {sortedSeats.map(seat => {
                    // Add aisle gap between seat 6 and 7
                    const addAisle = seat.seatNumber === 7
                    const isSelected = selectedIds.has(seat.seatId)
                    let seatClass = 'seat '
                    if (seat.occupied) {
                      seatClass += 'taken'
                    } else if (isSelected) {
                      seatClass += 'selected'
                    } else if (isVip) {
                      seatClass += 'vip'
                    } else {
                      seatClass += 'free'
                    }
                    return (
                      <span key={seat.seatId}>
                        {addAisle && <div className="aisle" />}
                        <div
                          className={seatClass}
                          title={seat.occupied ? 'Obsadené' : `${isVip ? 'VIP – ' : ''}${rowToLetter(rowNum)}${seat.seatNumber}`}
                          onClick={() => !seat.occupied && step === 'seats' && toggleSeat(seat.seatId)}
                        />
                      </span>
                    )
                  })}
                </div>
              )
            })}
          </div>

          <div className="seat-legend">
            <div className="legend-item"><div className="legend-dot free" /> Voľné</div>
            <div className="legend-item"><div className="legend-dot taken" /> Obsadené</div>
            <div className="legend-item"><div className="legend-dot selected" /> Vybrané</div>
            <div className="legend-item"><div className="legend-dot vip" /> VIP</div>
          </div>
        </div>

        {/* RIGHT: Booking panel */}
        <div className="booking-panel">
          {step === 'seats' && (
            <>
              <div className="panel-title">Vaša rezervácia</div>
              {performance && (
                <div className="panel-show">
                  <h4>{performance.show.title}</h4>
                  <p>{formatDate(performance.startTime)} · {formatTime(performance.startTime)}</p>
                  <p style={{ marginTop: 4, fontSize: 12, color: 'var(--muted)' }}>
                    {performance.hall?.name ?? 'Hlavná sála'}
                  </p>
                </div>
              )}

              <div className="selected-seats">
                <h5>Vybrané sedadlá</h5>
                <div>
                  {selectedIds.size === 0 ? (
                    <span style={{ color: 'var(--muted)', fontSize: 12 }}>Žiadne sedadlá</span>
                  ) : (
                    Array.from(selectedIds).map(id => {
                      const s = seatMap.find(x => x.seatId === id)
                      return s ? (
                        <span key={id} className="seat-tag">
                          {rowToLetter(s.rowNumber)}{s.seatNumber}
                        </span>
                      ) : null
                    })
                  )}
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>
                  {selectedIds.size} sedadl{selectedIds.size === 1 ? 'o' : selectedIds.size < 5 ? 'á' : 'í'}
                </div>
              </div>

              <div className="price-breakdown">
                <div className="price-row">
                  <span>{selectedIds.size}× sedadlo</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                <div className="price-row">
                  <span>Servisný poplatok</span>
                  <span>{fee > 0 ? `${fee} €` : '–'}</span>
                </div>
                <div className="price-row total">
                  <span>Celkom</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
              </div>

              <button
                className="btn-book"
                onClick={handleContinue}
                disabled={selectedIds.size === 0}
              >
                Pokračovať k platbe
              </button>
            </>
          )}

          {step === 'form' && (
            <>
              <div className="panel-title">Kontaktné údaje</div>
              <div className="booking-step-title">
                {selectedIds.size} sedadl{selectedIds.size === 1 ? 'o' : 'á'} · {total.toFixed(2)} €
              </div>

              {user ? (
                <div className="guest-info-block">
                  <strong style={{ fontSize: 14 }}>{user.name}</strong>
                  <p>{user.email}</p>
                </div>
              ) : (
                <div className="booking-form">
                  <div className="form-group">
                    <label>Meno a priezvisko</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      placeholder="Ján Novák"
                    />
                  </div>
                  <div className="form-group">
                    <label>E-mail</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={e => setGuestEmail(e.target.value)}
                      placeholder="vas@email.sk"
                    />
                  </div>
                </div>
              )}

              {error && <div className="error-msg">{error}</div>}

              <div className="price-breakdown" style={{ marginTop: 16 }}>
                <div className="price-row total">
                  <span>Celkom</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
              </div>

              <button
                className="btn-book"
                onClick={handleSubmitReservation}
                disabled={submitting}
              >
                {submitting ? 'Spracovávam...' : 'Potvrdiť rezerváciu'}
              </button>
              <button className="btn-back-small" onClick={() => { setError(''); setStep('seats') }}>
                ← Späť na sedadlá
              </button>
            </>
          )}

          {step === 'success' && (
            <div className="success-screen">
              <div className="success-icon">✅</div>
              <h3>Rezervácia potvrdená!</h3>
              {reservationId && (
                <div className="success-ref">#{reservationId}</div>
              )}
              <p>
                {reservationEmail
                  ? `Potvrdenie bolo odoslané na ${reservationEmail}.`
                  : 'Vaša rezervácia bola úspešne zaznamenaná.'}
              </p>
              <button className="btn-primary" onClick={() => navigate('/shows')}>
                Späť na predstavenia
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
