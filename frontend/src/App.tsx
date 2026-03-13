import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Nav from './components/Nav'
import HomePage from './pages/HomePage'
import ShowsPage from './pages/ShowsPage'
import HowPage from './pages/HowPage'
import ShowDetailPage from './pages/ShowDetailPage'
import SeatMapPage from './pages/SeatMapPage'
import MyReservationsPage from './pages/MyReservationsPage'
import AccountPage from './pages/AccountPage'

function App() {
  return (
    <AppProvider>
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shows" element={<ShowsPage />} />
        <Route path="/shows/:showId" element={<ShowDetailPage />} />
        <Route path="/performances/:performanceId/seats" element={<SeatMapPage />} />
        <Route path="/how" element={<HowPage />} />
        <Route path="/my-reservations" element={<MyReservationsPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  )
}

export default App
