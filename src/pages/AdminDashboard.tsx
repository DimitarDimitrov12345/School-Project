import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ADMIN_LOGIN_PATH } from '../config/admin'
import { useState } from 'react'
import { getFixturesForDateRange, formatDate } from '../lib/fixturesApi'
import '../styles/auth.css'

export default function AdminDashboard() {
  const { profile, signOut, loading } = useAuth()
  const navigate = useNavigate()
  const [fixtureId, setFixtureId] = useState('')
  const [loadingFixture, setLoadingFixture] = useState(false)
  const [fixtureFeedback, setFixtureFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Download Fixtures state
  const [loadingFixtures, setLoadingFixtures] = useState(false)
  const [fixturesFeedback, setFixturesFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [savedFiles, setSavedFiles] = useState<string[]>([])

  const apiKey = import.meta.env.VITE_FOOTBALL_API_KEY

  // Check for demo mode
  const demoSession = localStorage.getItem('adminSession')
  const isDemoMode = demoSession ? JSON.parse(demoSession).demoMode : false

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p>Зареждане…</p>
        </div>
      </div>
    )
  }

  // TODO: Re-enable authentication check when database is working
  // if (profile?.role !== 'admin') {
  //   navigate(ADMIN_LOGIN_PATH, { replace: true })
  //   return null
  // }

  const handleLogout = async () => {
    localStorage.removeItem('adminSession')
    await signOut()
    navigate(ADMIN_LOGIN_PATH, { replace: true })
  }

  const handleDownloadFixtures = async () => {
    setLoadingFixtures(true)
    setFixturesFeedback(null)
    setSavedFiles([])

    try {
      if (!apiKey || apiKey === 'your_api_sports_key') {
        setFixturesFeedback({ type: 'error', message: '❌ API ключът не е зададен в .env файла!' })
        setLoadingFixtures(false)
        return
      }

      // Step 1: Delete old fixtures
      setFixturesFeedback({ type: 'success', message: '🗑️ Изтриване на стари мачове...' })
      try {
        await fetch('/api/delete-all-fixtures', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      } catch { /* ignore */ }

      // Step 2: Fetch from API
      setFixturesFeedback({ type: 'success', message: '🌐 Изтегляне от API Sports...' })
      const fixturesData = await getFixturesForDateRange(apiKey)

      // Step 3: Save all 3 days
      setFixturesFeedback({ type: 'success', message: '💾 Запазване на файлове...' })
      const yesterday = formatDate(-1)
      const today = formatDate(0)
      const tomorrow = formatDate(1)

      const dates = [
        { data: fixturesData.yesterday.data, date: yesterday },
        { data: fixturesData.today.data, date: today },
        { data: fixturesData.tomorrow.data, date: tomorrow },
      ]

      const saved: string[] = []
      for (const { data, date } of dates) {
        try {
          const res = await fetch('/api/save-fixtures', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, data })
          })
          if (res.ok) saved.push(`fixtures_${date}.json`)
        } catch { /* ignore */ }
      }

      setSavedFiles(saved)
      if (saved.length === 3) {
        setFixturesFeedback({ type: 'success', message: `✅ Изтеглени ${saved.length}/3 файла!\n\n📄 ${saved.join('\n📄 ')}` })
      } else if (saved.length > 0) {
        setFixturesFeedback({ type: 'success', message: `⚠️ Запазени ${saved.length}/3 файла` })
      } else {
        setFixturesFeedback({ type: 'error', message: '❌ Неуспешно запазване! Уверете се, че сървърът работи (npm run server)' })
      }
    } catch (err) {
      setFixturesFeedback({ type: 'error', message: `❌ Грешка: ${err instanceof Error ? err.message : 'Непозната грешка'}` })
    } finally {
      setLoadingFixtures(false)
    }
  }

  const handleDownloadFixtureById = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fixtureId.trim()) {
      setFixtureFeedback({ type: 'error', message: 'Моля, въведете ID на мач' })
      return
    }

    setLoadingFixture(true)
    setFixtureFeedback(null)

    try {
      // Download from API and save
      const response = await fetch(`/api/download-fixture?id=${fixtureId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()

      if (data.success && data.fixture) {
        // Store selected fixture in localStorage
        localStorage.setItem('selectedFixture', JSON.stringify(data.fixture))
        setFixtureFeedback({ 
          type: 'success', 
          message: `✅ Изтеглен мач ${fixtureId}!\n\n${data.fixture.teams.home.name} срещу ${data.fixture.teams.away.name}\n\n📄 Запазен в: ${data.filename}` 
        })
        setFixtureId('')
        
        // Update featured match in navbar
        window.dispatchEvent(new CustomEvent('fixtureSelected', { detail: data.fixture }))
      } else {
        setFixtureFeedback({ type: 'error', message: `❌ Неуспешно изтегляне на мач ${fixtureId}: ${data.error}` })
      }
    } catch (err) {
      setFixtureFeedback({ type: 'error', message: `❌ Грешка: ${err instanceof Error ? err.message : 'Непозната грешка'}` })
    } finally {
      setLoadingFixture(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <h1 className="auth-title">Администраторски панел</h1>
        <p className="auth-subtitle">
          {isDemoMode ? '🎮 Демо режим' : (profile?.email ? `Влезли сте като ${profile.email}` : '(Демо режим - без авт.)')}
        </p>
        
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>🎯 Изтегляне на мач по ID</h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#666' }}>
              Пробвайте: <strong>1446996</strong> (от днешните мачове)
            </p>
            <form onSubmit={handleDownloadFixtureById} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="number"
                placeholder="Въведете ID на мач"
                value={fixtureId}
                onChange={(e) => setFixtureId(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                disabled={loadingFixture}
              />
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  opacity: loadingFixture ? 0.6 : 1
                }}
                disabled={loadingFixture}
              >
                {loadingFixture ? '⬼ Зареждане...' : '📥 Изтегли'}
              </button>
            </form>
            
            <button
              onClick={() => {
                setFixtureId('1446996')
                setTimeout(() => handleDownloadFixtureById({ preventDefault: () => {} } as any), 100)
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                marginBottom: '12px'
              }}
            >
              ⚡ Бързо изтегляне: 1446996
            </button>
            
            {fixtureFeedback && (
              <div style={{
                margin: '12px 0 0 0',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '13px',
                backgroundColor: fixtureFeedback.type === 'success' ? '#d4edda' : '#f8d7da',
                color: fixtureFeedback.type === 'success' ? '#155724' : '#721c24',
                whiteSpace: 'pre-wrap',
                fontFamily: fixtureFeedback.type === 'success' ? 'monospace' : 'inherit'
              }}>
                {fixtureFeedback.message}
              </div>
            )}
            
            {fixtureFeedback?.type === 'success' && (
              <a
                href="/saved-fixtures/fixture_1446996.json"
                download
                style={{
                  display: 'inline-block',
                  marginTop: '12px',
                  padding: '8px 16px',
                  background: '#2196F3',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}
              >
                💾 Изтегли JSON файл
              </a>
            )}
          </div>

          <div style={{ padding: '16px', background: '#f0f4ff', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>📅 Изтегляне на мачове по дата</h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#666' }}>
              Изтегля мачовете за вчера, днес и утре от API Sports и ги запазва на сървъра.
            </p>
            <button
              onClick={handleDownloadFixtures}
              disabled={loadingFixtures}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: loadingFixtures ? '#999' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loadingFixtures ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '12px'
              }}
            >
              {loadingFixtures ? '⏳ Изтегляне от API...' : '🎯 Изтегли мачове (3 дни)'}
            </button>

            {fixturesFeedback && (
              <div style={{
                margin: '0 0 12px 0',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '13px',
                backgroundColor: fixturesFeedback.type === 'success' ? '#d4edda' : '#f8d7da',
                color: fixturesFeedback.type === 'success' ? '#155724' : '#721c24',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace'
              }}>
                {fixturesFeedback.message}
              </div>
            )}

            {savedFiles.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {savedFiles.map(file => (
                  <a
                    key={file}
                    href={`/saved-fixtures/${file}`}
                    download
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      background: '#2196F3',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}
                  >
                    💾 {file}
                  </a>
                ))}
              </div>
            )}
          </div>

          <p style={{ color: 'var(--text-secondary)' }}>
            Управлявайте лиги, мачове, потребители и отчети оттук.
          </p>
          <button
            type="button"
            className="auth-submit"
            style={{ background: 'var(--btn-secondary)' }}
            onClick={() => navigate('/')}
          >
            Към сайта
          </button>
          {profile?.email && (
            <button type="button" className="auth-submit" style={{ background: 'var(--status-live)' }} onClick={handleLogout}>
              Изход
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
