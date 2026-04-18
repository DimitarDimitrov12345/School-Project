import { useNavigate } from 'react-router-dom'
import FixturesManager from '../components/FixturesManagerNew'
import '../styles/auth.css'

export default function DownloadsPage() {
  const navigate = useNavigate()

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 1000 }}>
        <button
          type="button"
          className="auth-close-btn"
          onClick={() => navigate('/')}
          aria-label="Close"
          style={{ position: 'absolute', top: 16, right: 16 }}
        >
          ✕
        </button>

        <h1 className="auth-title">Изтегляне на мачове</h1>
        <p className="auth-subtitle">Изтеглете футболни мачове като JSON файлове</p>

        <FixturesManager />

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            type="button"
            className="auth-submit"
            style={{ background: 'var(--btn-secondary)' }}
            onClick={() => navigate('/')}
          >
            ← Към началото
          </button>
        </div>
      </div>
    </div>
  )
}
