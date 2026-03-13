import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'


export default function Footer() {
  const navigate = useNavigate()
  const { user, openLoginModal, openRegisterModal } = useApp()

  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <a className="logo" onClick={() => navigate('/')}>
            Klára
          </a>
          <p>Moderný rezervačný systém pre divadelné predstavenia. Jednoduchá rezervácia, pohodlný nákup lístkov.</p>
        </div>
        <div className="footer-col">
          <h5>Predstavenia</h5>
          <a onClick={() => navigate('/shows')}>Dráma</a>
          <a onClick={() => navigate('/shows')}>Komédia</a>
          <a onClick={() => navigate('/shows')}>Muzikál</a>
          <a onClick={() => navigate('/shows')}>Tragédia</a>
        </div>
        <div className="footer-col">
          <h5>Účet</h5>
          {user ? (
            <a onClick={() => navigate('/my-reservations')}>Moje rezervácie</a>
          ) : (
            <>
              <a onClick={openLoginModal}>Prihlásenie</a>
              <a onClick={openRegisterModal}>Registrácia</a>
            </>
          )}
        </div>
        <div className="footer-col">
          <h5>Info</h5>
          <a onClick={() => navigate('/how')}>Ako to funguje</a>
          <a>O divadle</a>
          <a>Kontakt</a>
          <a>GDPR</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 Klára. Všetky práva vyhradené.</span>
        <span>Navrhnuté pre VPSI projekt</span>
      </div>
    </footer>
  )
}
