import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { authApi } from '../api/api'

export default function VerifyPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    if (!token) {
      setStatus('error')
      setMessage('Chýba overovací token.')
      return
    }
    authApi.verify(token)
      .then(res => {
        setMessage(res.message)
        setStatus('success')
      })
      .catch(err => {
        setMessage(err instanceof Error ? err.message : 'Overenie zlyhalo.')
        setStatus('error')
      })
  }, [token])

  return (
    <section className="verify-page">
      <div className="verify-card">
        <span className="modal-logo">Klára</span>

        {status === 'loading' && (
          <>
            <div className="loading-wrap" style={{ marginTop: 24 }}><div className="spinner" /></div>
            <p className="modal-sub">Overujem váš účet...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="verify-icon verify-icon--ok">✓</div>
            <h2>Účet overený</h2>
            <p className="modal-sub">{message}</p>
            <button className="btn-form" onClick={() => navigate('/')}>
              Prejsť na úvodnú stránku
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="verify-icon verify-icon--err">✕</div>
            <h2>Overenie zlyhalo</h2>
            <p className="modal-sub">{message}</p>
            <button className="btn-form" onClick={() => navigate('/')}>
              Späť na úvodnú stránku
            </button>
          </>
        )}
      </div>
    </section>
  )
}
