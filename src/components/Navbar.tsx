import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../styles/navbar.css'
import logo from '../assets/logo.svg'
import { useAuth } from '../contexts/AuthContext'
import { ADMIN_DASHBOARD_PATH } from '../config/admin'

interface Props {
  onToggleSidebar?: () => void
  sidebarOpen?: boolean
}

const Navbar: React.FC<Props> = () => {
  const { user, profile, loading, signOut } = useAuth()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const location = useLocation()

  const handleLogout = async () => {
    await signOut()
    setProfileMenuOpen(false)
  }

  const isLoggedIn = !!user && !!profile
  const isAdmin = profile?.role === 'admin'
  const showLoginOnlyImage = location.pathname === '/login'

  return (
    <header className="top-nav" role="banner">
      <div className="left">
        <Link to="/" className="brand" aria-label="Go to main menu">
          <img src={logo} alt="Footy logo" className="brand-logo" />
          <span className="brand-name">finalscore</span>
        </Link>
      </div>

      <div className="right">
        {loading ? (
          <span className="navbar-date">Loading…</span>
        ) : !isLoggedIn ? (
          <>
            <div className="auth-buttons">
              <Link to="/login">
                <button className="btn-login">Log In</button>
              </Link>
              <Link to="/signup">
                <button className="btn-signup">Sign Up</button>
              </Link>
            </div>
            {showLoginOnlyImage && (
              <div className="navbar-image">
                <img src={logo} alt="Football icon" className="navbar-icon" />
              </div>
            )}
          </>
        ) : (
            <div className="profile-section">
              <button
                className="profile-btn"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                aria-expanded={profileMenuOpen}
                aria-label="Toggle profile menu"
                title="Open profile menu"
              >
                <div className="profile-avatar">👤</div>
                <span className="user-name">{profile.username ?? profile.email?.split('@')[0]}</span>
                <span className="user-role-badge">{profile.role}</span>
              </button>

              <button
                className="logout-btn"
                onClick={async () => {
                  await handleLogout()
                }}
                aria-label="Log out"
                title="Log out"
              >
                Log out
              </button>

              {profileMenuOpen && (
                <div className="profile-menu">
                {profile.role === 'user' && (
                  <>
                    <Link to="/" className="menu-item" onClick={() => setProfileMenuOpen(false)}>
                      👤 My Profile
                    </Link>
                    <a href="#predictions" className="menu-item">
                      🎯 My Predictions
                    </a>
                    <a href="#favorites" className="menu-item">
                      ⭐ Favorites
                    </a>
                    <a href="#settings" className="menu-item">
                      ⚙️ Settings
                    </a>
                    <div className="menu-divider" />
                    <button className="menu-item danger" onClick={handleLogout}>
                      🚪 Log Out
                    </button>
                  </>
                )}

                {isAdmin && (
                  <>
                    <Link
                      to={ADMIN_DASHBOARD_PATH}
                      className="menu-item"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      📊 Admin Dashboard
                    </Link>
                    <a href="#leagues" className="menu-item">
                      🏆 Manage Leagues
                    </a>
                    <a href="#matches" className="menu-item">
                      ⚽ Manage Matches
                    </a>
                    <a href="#users" className="menu-item">
                      👥 Users
                    </a>
                    <a href="#reports" className="menu-item">
                      📈 Reports
                    </a>
                    <a href="#settings" className="menu-item">
                      ⚙️ Settings
                    </a>
                    <div className="menu-divider" />
                    <button className="menu-item danger" onClick={handleLogout}>
                      🚪 Log Out
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
