import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFixturesForDateRange, formatDate } from '../lib/fixturesApi'
import type { FixturesResponse } from '../lib/fixturesApi'
import '../styles/fixturesManager.css'

interface StoredFixtures {
  yesterday: { date: string; data: FixturesResponse }
  today: { date: string; data: FixturesResponse }
  tomorrow: { date: string; data: FixturesResponse }
}

export default function FixturesManager() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fixtures, setFixtures] = useState<StoredFixtures | null>(null)
  const [selectedDate, setSelectedDate] = useState<'yesterday' | 'today' | 'tomorrow'>('today')

  const apiKey = import.meta.env.VITE_FOOTBALL_API_KEY

  // No auto-redirect - let user click button
  useEffect(() => {
    if (success && !loading && !error) {
      // Success modal stays open until user clicks button
    }
  }, [success, loading, error])

  const deleteOldFixtures = async () => {
    try {
      console.log('🗑️ Deleting old fixtures...')
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch('/api/delete-all-fixtures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        console.log('✅ Old fixtures deleted')
        return true
      }
    } catch (err) {
      console.warn('⚠️ Could not delete old fixtures:', err)
    }
    return false
  }

  const saveJsonFile = async (data: any, date: string) => {
    try {
      console.log(`🔄 Saving: fixtures_${date}.json`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch('/api/save-fixtures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: date, data: data }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      const result = await response.json()
      
      if (!response.ok) {
        console.error(`❌ Save failed for ${date}:`, result)
        return false
      }
      
      console.log(`✅ Saved: ${result.filename} to ${result.filepath}`)
      return true
    } catch (err) {
      console.error(`❌ Error saving ${date}:`, err)
      return false
    }
  }

  const handleDownloadFixtures = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setFixtures(null)

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false)
      setError('❌ Request timeout! Make sure:\n1. API key is set in .env.local\n2. Server is running (npm run server)\n3. Internet connection works')
    }, 15000)

    try {
      // Step 0: Delete old fixtures
      console.log('🗑️ Cleaning old fixtures...')
      setSuccess('🗑️ Cleaning old fixtures...')
      await deleteOldFixtures()

      // Step 1: Validate API key
      if (!apiKey || apiKey === 'your_api_sports_key') {
        console.error('❌ API KEY MISSING')
        setError('❌ NO API KEY!\n\nCreate .env.local file with:\nVITE_FOOTBALL_API_KEY=your_key_here\n\nGet key from: https://www.api-sports.io/')
        setLoading(false)
        return
      }
      console.log('✅ API Key found')

      // Step 2: Fetch from API
      console.log('🔄 Fetching fixtures from API...')
      setSuccess('🔄 Fetching fixtures from API...')
      
      const fixturesData = await getFixturesForDateRange(apiKey)
      console.log('✅ Got fixtures:', fixturesData)

      // Step 3: Save to state
      setFixtures(fixturesData)
      localStorage.setItem('football_fixtures', JSON.stringify(fixturesData))
      
      const today = formatDate(0)
      const yesterday = formatDate(-1)
      const tomorrow = formatDate(1)

      // Step 4: Save all 3 JSON files
      console.log('💾 Saving files...')
      setSuccess('💾 Saving files to /saved-fixtures/...')
      
      const results = await Promise.allSettled([
        saveJsonFile(fixturesData.yesterday.data, yesterday),
        saveJsonFile(fixturesData.today.data, today),
        saveJsonFile(fixturesData.tomorrow.data, tomorrow)
      ])

      const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length
      const failed = results.filter(r => r.status === 'fulfilled' && r.value === false).length

      console.log(`📊 Results: ${successful} saved, ${failed} failed`)

      if (successful === 3) {
        setSuccess(`✅ DOWNLOAD COMPLETE!\n\n✅ Old files deleted\n✅ 3 new files downloaded\n✅ Saved to /saved-fixtures/\n\n📄 fixtures_${yesterday}.json\n📄 fixtures_${today}.json\n📄 fixtures_${tomorrow}.json`)
      } else if (successful > 0) {
        setSuccess(`⚠️ PARTIAL SUCCESS\n\n${successful}/3 files saved\n${failed} files failed`)
      } else {
        setError(`❌ NO FILES SAVED!\n\nMake sure these are running:\n1. npm run dev\n2. npm run server`)
      }
    } catch (err) {
      console.error('❌ CRITICAL ERROR:', err)
      setError(`❌ ERROR:\n\n${err instanceof Error ? err.message : String(err)}`)
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }

  const handleDownloadSingleJSON = () => {
    if (!fixtures) {
      setError('❌ No fixtures loaded')
      return
    }

    const data = fixtures[selectedDate]
    saveJsonFile(data, data.date)
    setSuccess(`✅ Downloaded: fixtures_${data.date}.json`)
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleViewJSON = () => {
    if (!fixtures) return
    const data = fixtures[selectedDate]
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    window.open(url)
  }

  const currentData = fixtures ? fixtures[selectedDate] : null
  const fixtureCount = currentData?.data.results || 0

  return (
    <div className="fixtures-manager">
      <h2>⬇️ Изтегляне на футболни мачове</h2>

      <button 
        onClick={handleDownloadFixtures} 
        disabled={loading} 
        className="btn-primary" 
        style={{ 
          fontSize: '18px', 
          padding: '16px 32px', 
          width: '100%',
          display: 'block'
        }}
      >
        {loading ? '⏳ ИЗТЕГЛЯНЕ ОТ API...' : '🎯 ИЗТЕГЛИ МАЧОВЕ СЕГА'}
      </button>

      {/* Status Display - Load on Page */}
      {loading && (
        <div style={{
          marginTop: '24px',
          padding: '24px',
          background: '#f0f4ff',
          border: '2px solid #667eea',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 2s linear infinite' }}>⚙️</div>
          <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '20px' }}>Изтегляне на мачове...</h3>
          <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>🌐 Свързване към API Sports</p>
          <div style={{
            marginTop: '16px',
            height: '6px',
            background: '#e0e0e0',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '3px',
              animation: 'loading 1.5s ease-in-out infinite'
            }}></div>
          </div>
          <p style={{ margin: '16px 0 0 0', color: '#666', fontSize: '12px' }}>{success || 'Изтегляне...'}</p>
          <button 
            onClick={() => setLoading(false)}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#999',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Отказ
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && !loading && (
        <div style={{
          marginTop: '24px',
          padding: '24px',
          background: '#ffebee',
          border: '2px solid #d32f2f',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h3 style={{ margin: '0 0 12px 0', color: '#d32f2f', fontSize: '20px' }}>Грешка</h3>
          <p style={{
            margin: '16px 0',
            color: '#333',
            fontSize: '14px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            background: '#ffffff',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #ffcdd2'
          }}>
            {error}
          </p>
          <button 
            onClick={() => setError(null)}
            style={{
              marginTop: '16px',
              padding: '10px 24px',
              background: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Затвори
          </button>
        </div>
      )}

      {/* Success Display */}
      {success && !loading && !error && (
        <div style={{
          marginTop: '24px',
          padding: '24px',
          background: '#e8f5e9',
          border: '2px solid #4caf50',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h3 style={{ margin: '0 0 12px 0', color: '#2e7d32', fontSize: '20px' }}>Изтеглянето завърши!</h3>
          <p style={{
            margin: '16px 0',
            color: '#333',
            fontSize: '14px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            background: '#ffffff',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #c8e6c9',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {success}
          </p>
          <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => { setSuccess(null); setFixtures(null) }}
              style={{
                padding: '12px 24px',
                background: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ← Остани на страницата
            </button>
            <button 
              onClick={() => navigate('/')}
              style={{
                padding: '12px 24px',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🏠 Към началото
            </button>
            <button 
              onClick={() => navigate('/admin')}
              style={{
                padding: '12px 24px',
                background: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ⚙️ Към админ панела
            </button>
          </div>
        </div>
      )}

      {/* Results Display */}
      {fixtures && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ padding: '16px', background: '#e8f5e9', borderRadius: '6px', border: '2px solid #4caf50' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#2e7d32' }}>✅ 3 JSON ФАЙЛА ЗАПАЗЕНИ!</h3>
            <p style={{ margin: '8px 0' }}>📂 Местоположение: /saved-fixtures/</p>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>fixtures_{fixtures.yesterday.date}.json</li>
              <li>fixtures_{fixtures.today.date}.json</li>
              <li>fixtures_{fixtures.tomorrow.date}.json</li>
            </ul>
          </div>

          <div style={{ marginTop: '24px' }}>
            <h3>📋 Преглед на мачове по дата</h3>
            <div className="date-tabs">
              {['yesterday', 'today', 'tomorrow'].map((date) => (
                <button
                  key={date}
                  className={`date-tab ${selectedDate === date ? 'active' : ''}`}
                  onClick={() => setSelectedDate(date as any)}
                >
                  {date === 'yesterday' ? 'Вчера' : date === 'today' ? 'Днес' : 'Утре'}
                  <br />
                  <small>
                    {date === 'yesterday' ? fixtures.yesterday.date : date === 'today' ? fixtures.today.date : fixtures.tomorrow.date}
                  </small>
                </button>
              ))}
            </div>

            {currentData && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#f5f5f5', borderRadius: '6px' }}>
                <p><strong>Общо мачове:</strong> {fixtureCount}</p>

                {fixtureCount > 0 ? (
                  <div style={{ maxHeight: '250px', overflowY: 'auto', marginTop: '12px' }}>
                    {currentData.data.response.slice(0, 5).map((fixture) => (
                      <div
                        key={fixture.fixture.id}
                        style={{
                          padding: '10px',
                          margin: '6px 0',
                          background: 'white',
                          borderRadius: '4px',
                          fontSize: '12px',
                          border: '1px solid #ddd'
                        }}
                      >
                        <div style={{ fontWeight: 'bold', color: '#1976d2' }}>{fixture.league.name}</div>
                        <div style={{ margin: '4px 0' }}>
                          {fixture.teams.home.name} <strong>vs</strong> {fixture.teams.away.name}
                        </div>
                        <div style={{ color: '#666', fontSize: '11px' }}>
                          {fixture.fixture.date} • {fixture.status?.short || 'N/A'}
                        </div>
                      </div>
                    ))}
                    {fixtureCount > 5 && (
                      <div style={{ padding: '8px', textAlign: 'center', color: '#999', fontSize: '11px' }}>
                        ... и още {fixtureCount - 5} мача
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ color: '#999' }}>Няма мачове за тази дата</p>
                )}

                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button onClick={handleDownloadSingleJSON} className="btn-download" style={{ flex: 1 }}>
                    📥 Изтегли тази дата
                  </button>
                  <button onClick={handleViewJSON} className="btn-view" style={{ flex: 1 }}>
                    👁️ Покажи JSON
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 100%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  )
}
