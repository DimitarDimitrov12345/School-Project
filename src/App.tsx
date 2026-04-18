import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
import './App.css'
import Home from './pages/Home'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import FeaturedMatch from './components/FeaturedMatch'
import MobileLeagues from './components/MobileLeagues'
import BottomNavbar from './components/BottomNavbar'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import DownloadsPage from './pages/DownloadsPage'
import GameDetailsPage from './pages/GameDetailsPage'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import { AuthProvider } from './contexts/AuthContext'
import { ADMIN_LOGIN_PATH, ADMIN_DASHBOARD_PATH } from './config/admin'

type MainLayoutProps = {
  showLogin?: boolean
  showSignUp?: boolean
}

function MainLayout({ showLogin, showSignUp }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="app layout">
      <Navbar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
      />
      <div className={`main ${sidebarOpen ? '' : 'sidebar-closed'}`}>
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="content">
          <Home />
          <MobileLeagues />
        </div>
        <aside className="rightpane" aria-label="Right pane">
          <div className="rightpane-inner">
            <FeaturedMatch />
          </div>
        </aside>
      </div>
      <BottomNavbar />

      {(showLogin || showSignUp) && (
        <div>
          {showLogin && <Login />}
          {showSignUp && <SignUp />}
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />} />
          <Route path="/login" element={<MainLayout showLogin />} />
          <Route path="/signup" element={<MainLayout showSignUp />} />
          <Route path="/download-fixtures" element={<DownloadsPage />} />
          <Route path="/game/:fixtureId" element={<GameDetailsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path={ADMIN_LOGIN_PATH} element={<AdminLogin />} />
          <Route
            path={ADMIN_DASHBOARD_PATH}
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
