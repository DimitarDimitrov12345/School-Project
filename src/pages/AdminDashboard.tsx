import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ADMIN_LOGIN_PATH } from '../config/admin'
import '../styles/auth.css'

export default function AdminDashboard() {
  const { profile, signOut, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p>Loading…</p>
        </div>
      </div>
    )
  }

  if (profile?.role !== 'admin') {
    navigate(ADMIN_LOGIN_PATH, { replace: true })
    return null
  }

  const handleLogout = async () => {
    await signOut()
    navigate(ADMIN_LOGIN_PATH, { replace: true })
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <h1 className="auth-title">Admin dashboard</h1>
        <p className="auth-subtitle">Signed in as {profile?.email}</p>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage leagues, matches, users, and reports from here.
          </p>
          <button
            type="button"
            className="auth-submit"
            style={{ background: 'var(--btn-secondary)' }}
            onClick={() => navigate('/')}
          >
            Back to site
          </button>
          <button type="button" className="auth-submit" style={{ background: 'var(--status-live)' }} onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}
