import { useState } from 'react'
import { getFixturesForDateRange, formatDate } from '../lib/fixturesApi'
import type { FixturesResponse } from '../lib/fixturesApi'
import '../styles/fixturesManager.css'

interface StoredFixtures {
  yesterday: { date: string; data: FixturesResponse }
  today: { date: string; data: FixturesResponse }
  tomorrow: { date: string; data: FixturesResponse }
}

interface SavedFile {
  date: string
  filename: string
  timestamp: string
}

export default function FixturesManager() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fixtures, setFixtures] = useState<StoredFixtures | null>(null)
  const [selectedDate, setSelectedDate] = useState<'yesterday' | 'today' | 'tomorrow'>('today')
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([])

  const apiKey = import.meta.env.VITE_FOOTBALL_API_KEY

  const handleDownloadFixtures = async () => {
    console.log('🔄 Download started...')
    console.log('API Key:', apiKey ? '✅ Set' : '❌ NOT SET')
    
    if (!apiKey || apiKey === 'your_api_sports_key') {
      const errMsg = '❌ API key not configured!\n\n1. Get key from api-football.com\n2. Add to .env:\nVITE_FOOTBALL_API_KEY=your_key_here\n3. Restart with npm run dev'
      console.error(errMsg)
      setError(errMsg)
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log('🔄 Fetching fixtures from API...')
      const fixturesData = await getFixturesForDateRange(apiKey)
      console.log('✅ Fixtures fetched successfully')
      console.log('Response:', fixturesData)
      
      if (!fixturesData || !fixturesData.today) {
        throw new Error('Invalid response from API')
      }

      setFixtures(fixturesData)
      localStorage.setItem('football_fixtures', JSON.stringify(fixturesData))
      console.log('✅ Saved to localStorage')
      
      const today = formatDate(0)
      const yesterday = formatDate(-1)
      const tomorrow = formatDate(1)
      
      console.log('📅 Dates:', { yesterday, today, tomorrow })
      
      // Try to save to server
      let savedToServer = false
      try {
        console.log('💾 Attempting to save to server...')
        const saveResponse = await fetch('/api/save-all-fixtures', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            yesterday: fixturesData.yesterday,
            today: fixturesData.today,
            tomorrow: fixturesData.tomorrow
          })
        })

        if (saveResponse.ok) {
          const saveResult = await saveResponse.json()
          console.log('✅ Saved to server:', saveResult)
          
          const newFiles: SavedFile[] = saveResult.files.map((f: any) => ({
            date: f.date,
            filename: f.filename,
            timestamp: new Date().toLocaleTimeString()
          }))
          setSavedFiles(newFiles)
          
          const successMsg = `✅ SAVED 3 FILES TO PROJECT FOLDER\n📁 saved-fixtures/\n📅 ${yesterday} | ${today} | ${tomorrow}\n⏰ ${new Date().toLocaleTimeString()}`
          setSuccess(successMsg)
          savedToServer = true
        }
      } catch (saveErr) {
        console.warn('⚠️ Server not available:', saveErr)
      }

      if (!savedToServer) {
        const newFiles: SavedFile[] = [
          { date: yesterday, filename: `fixtures_${yesterday}.json`, timestamp: new Date().toLocaleTimeString() },
          { date: today, filename: `fixtures_${today}.json`, timestamp: new Date().toLocaleTimeString() },
          { date: tomorrow, filename: `fixtures_${tomorrow}.json`, timestamp: new Date().toLocaleTimeString() }
        ]
        setSavedFiles(newFiles)
        
        const successMsg = `✅ SAVED TO BROWSER STORAGE\n📁 localStorage\n📅 ${yesterday} | ${today} | ${tomorrow}\n\n💡 To save to project folder:\n1. Open new terminal\n2. Run: npm run server\n⏰ ${new Date().toLocaleTimeString()}`
        setSuccess(successMsg)
      }

      setTimeout(() => setSuccess(null), 12000)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('❌ ERROR:', message)
      console.error('Full error:', err)
      setError(`❌ FAILED TO DOWNLOAD\n\n${message}\n\nCheck browser console (F12) for details`)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadFromStorage = () => {
    const stored = localStorage.getItem('football_fixtures')
    if (stored) {
      try {
        setFixtures(JSON.parse(stored))
        setSuccess('✅ Loaded from Browser Storage')
        setTimeout(() => setSuccess(null), 3000)
      } catch (err) {
        setError('❌ Failed to load fixtures from storage')
      }
    } else {
      setError('❌ No fixtures found in storage')
    }
  }

  const handleDownloadJSON = () => {
    if (!fixtures) {
      setError('❌ No fixtures loaded')
      return
    }

    const data = fixtures[selectedDate]
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const filename = `fixtures_${data.date}.json`
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setSuccess(`📥 Downloaded: ${filename}\n📂 Check your Downloads folder`)
    setTimeout(() => setSuccess(null), 4000)
  }

  const handleViewJSON = () => {
    if (!fixtures) return
    const data = fixtures[selectedDate]
    const json = JSON.stringify(data, null, 2)
    window.open('data:application/json,' + encodeURIComponent(json), '_blank')
  }

  const currentData = fixtures ? fixtures[selectedDate] : null
  const fixtureCount = currentData?.data.results || 0

  return (
    <div className="fixtures-manager">
      <h2>📥 Управление на мачове</h2>

      <div className="fixtures-controls">
        <button onClick={handleDownloadFixtures} disabled={loading} className="btn-primary">
          {loading ? '⏳ Изтегляне...' : '⬇️ Изтегли мачове'}
        </button>
        <button onClick={handleLoadFromStorage} className="btn-secondary">
          📂 Зареди от паметта
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {savedFiles.length > 0 && (
        <div className="saved-files">
          <h3>📁 Запазени файлове ({savedFiles.length})</h3>
          <div className="files-list">
            {savedFiles.map((file) => (
              <div key={file.date} className="file-item">
                <div className="file-info">
                  <div className="file-name">📄 {file.filename}</div>
                  <div className="file-meta">
                    <span>📅 {file.date}</span>
                    <span>⏰ {file.timestamp}</span>
                  </div>
                </div>
                <div className="file-location">💾 localStorage</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {fixtures && (
        <div className="storage-info">
          <h3>✅ Информация за съхранението</h3>
          <p>💾 <strong>Местоположение:</strong> Browser Storage (localStorage)</p>
          <p>📅 <strong>Дати:</strong> {fixtures.yesterday.date} | {fixtures.today.date} | {fixtures.tomorrow.date}</p>
          <p>🔑 <strong>Ключ:</strong> <code>football_fixtures</code></p>
        </div>
      )}

      {fixtures && (
        <div className="fixtures-content">
          <div className="date-tabs">
            <button
              className={`date-tab ${selectedDate === 'yesterday' ? 'active' : ''}`}
              onClick={() => setSelectedDate('yesterday')}
            >
              Yesterday
              <br />
              <small>{fixtures.yesterday.date}</small>
            </button>
            <button
              className={`date-tab ${selectedDate === 'today' ? 'active' : ''}`}
              onClick={() => setSelectedDate('today')}
            >
              Today
              <br />
              <small>{fixtures.today.date}</small>
            </button>
            <button
              className={`date-tab ${selectedDate === 'tomorrow' ? 'active' : ''}`}
              onClick={() => setSelectedDate('tomorrow')}
            >
              Tomorrow
              <br />
              <small>{fixtures.tomorrow.date}</small>
            </button>
          </div>

          {currentData && (
            <div className="fixtures-display">
              <div className="fixtures-header">
                <h3>Мачове за {currentData.date}</h3>
                <p className="fixture-count">Общо мачове: {fixtureCount}</p>
              </div>

              {fixtureCount > 0 ? (
                <div className="fixtures-list">
                  {currentData.data.response.slice(0, 10).map((fixture) => (
                    <div key={fixture.fixture.id} className="fixture-item">
                      <div className="fixture-league">{fixture.league.name}</div>
                      <div className="fixture-teams">
                        <div className="team">
                          <img src={fixture.teams.home.logo} alt={fixture.teams.home.name} />
                          <span>{fixture.teams.home.name}</span>
                        </div>
                        <div className="fixture-time">
                          {fixture.fixture.date.split('T')[1]?.substring(0, 5) || 'TBA'}
                        </div>
                        <div className="team">
                          <span>{fixture.teams.away.name}</span>
                          <img src={fixture.teams.away.logo} alt={fixture.teams.away.name} />
                        </div>
                      </div>
                      <div className="fixture-status">{fixture.status.short}</div>
                    </div>
                  ))}
                  {fixtureCount > 10 && (
                    <div className="fixtures-more">
                      ... и още {fixtureCount - 10} мача
                    </div>
                  )}
                </div>
              ) : (
                <p className="no-fixtures">Няма налични мачове за тази дата</p>
              )}

              <div className="json-actions">
                <button onClick={handleDownloadJSON} className="btn-download">
                  📥 Изтегли JSON
                </button>
                <button onClick={handleViewJSON} className="btn-view">
                  👁️ Покажи в браузъра
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
