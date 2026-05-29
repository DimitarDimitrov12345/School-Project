import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import MatchStatistics from '../components/MatchStatistics'
import Navbar from '../components/Navbar'
import BottomNavbar from '../components/BottomNavbar'
import Sidebar from '../components/Sidebar'
import FeaturedMatch from '../components/FeaturedMatch'
import '../styles/auth.css'
import '../styles/gameDetails.css'

type TabType = 'overview' | 'statistics' | 'lineups'

interface Fixture {
  fixture: {
    id: number
    date: string
    timestamp: number
    status: { short: string; long: string; elapsed?: number }
    venue?: { name: string; city: string }
    referee?: string
    periods?: { first: number; second: number }
  }
  league: { id: number; name: string; country: string; flag: string; round: string; season: number }
  teams: { home: { id: number; name: string; logo: string; winner?: boolean }; away: { id: number; name: string; logo: string; winner?: boolean } }
  goals: { home: number | null; away: number | null }
  score: { halftime: { home: number | null; away: number | null }; fulltime: { home: number | null; away: number | null } }
  events?: Array<{
    time: { elapsed: number; extra?: number | null }
    team: { id: number; name: string; logo: string }
    type: string
    detail: string
    player?: { id: number | null; name: string | null }
  }>
  statistics?: Array<{
    team: { id: number; name: string; logo: string }
    statistics: Array<{ type: string; value: number | string }>
  }>
  lineups?: Array<{
    team: { id: number; name: string; logo: string }
    formation: string
    startXI: Array<{ player: { id: number; name: string; number: number; pos: string } }>
    substitutes: Array<{ player: { id: number; name: string; number: number; pos: string } }>
  }>
}

export default function GameDetailsPage() {
  const { fixtureId } = useParams<{ fixtureId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [fixture, setFixture] = useState<Fixture | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [downloadingStats, setDownloadingStats] = useState(false)
  const requestedFixturesRef = useRef<Set<string>>(new Set())
  const inProgressFixturesRef = useRef<Set<string>>(new Set())

  // Auto-download fixture data from API in background
  const downloadFixtureFromAPI = async (id: string) => {
    if (requestedFixturesRef.current.has(id) || inProgressFixturesRef.current.has(id)) {
      return
    }

    try {
      inProgressFixturesRef.current.add(id)
      setDownloadingStats(true)
      console.log(`📥 Auto-downloading fixture ${id} from API...`)
      const response = await fetch(`/api/download-fixture?id=${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const data = await response.json()
        requestedFixturesRef.current.add(id)
        console.log(`✅ Fixture ${id} ready (${data.cached ? 'cached' : 'downloaded'})`)
        // Update state with the downloaded fixture that includes full statistics
        if (data.fixture) {
          setFixture(data.fixture)
        }
      }
    } catch (err) {
      console.error('Error auto-downloading fixture:', err)
    } finally {
      inProgressFixturesRef.current.delete(id)
      setDownloadingStats(false)
    }
  }

  useEffect(() => {
    if (!fixtureId) {
      setError('Не е подаден ID на мач')
      setLoading(false)
      return
    }

    // Try to load from localStorage first (if just selected)
    const savedFixture = localStorage.getItem('selectedFixture')
    if (savedFixture) {
      try {
        const fixture = JSON.parse(savedFixture)
        if (fixture.fixture.id.toString() === fixtureId) {
          setFixture(fixture)
          setLoading(false)
          // Download full data in background
          downloadFixtureFromAPI(fixtureId)
          return
        }
      } catch (e) {
        // Continue to fetch from server
      }
    }

    // Fetch from server (which tries today's fixtures first, then API)
    const fetchFixture = async () => {
      try {
        // Try to find in saved-fixtures first
        const today = new Date()
        const datesToTry = []
        for (let offset = -1; offset <= 1; offset++) {
          const d = new Date(today)
          d.setDate(d.getDate() + offset)
          datesToTry.push(d.toISOString().split('T')[0])
        }
        for (const date of datesToTry) {
          try {
            // Try API endpoint first (Vercel), then static file (local dev)
            let savedData: any = null
            const apiRes = await fetch(`/api/saved-fixtures?date=${date}`)
            if (apiRes.ok) {
              savedData = await apiRes.json()
            } else {
              const savedResponse = await fetch(`/saved-fixtures/fixtures_${date}.json`)
              if (savedResponse.ok) {
                savedData = await savedResponse.json()
              }
            }
            if (savedData) {
              const foundFixture = savedData.response?.find((f: any) => f.fixture.id.toString() === fixtureId)
              if (foundFixture) {
                setFixture(foundFixture)
                setLoading(false)
                // Download full data in background
                downloadFixtureFromAPI(fixtureId)
                return
              }
            }
          } catch (e) {
            // Continue to next date
          }
        }

        // If not found in saved files, try API endpoint
        const response = await fetch(`/api/fixture?id=${fixtureId}`)
        const data = await response.json()

        if (data.fixture) {
          setFixture(data.fixture)
          // Download full data to save it
          downloadFixtureFromAPI(fixtureId)
        } else {
          setError('Мачът не е намерен')
        }
      } catch (err) {
        setError('Неуспешно зареждане на мача')
      } finally {
        setLoading(false)
      }
    }

    fetchFixture()
  }, [fixtureId])

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p>Зареждане на мача...</p>
        </div>
      </div>
    )
  }

  if (error || !fixture) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p style={{ color: '#c33' }}>{error || 'Мачът не е намерен'}</p>
          <button
            onClick={() => navigate('/')}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Към начало
          </button>
        </div>
      </div>
    )
  }

  const { fixture: fixtureInfo, teams, goals, score, league } = fixture
  const status = fixture.fixture.status
  const goalHome = goals.home ?? '-'
  const goalAway = goals.away ?? '-'
  const htHome = score.halftime.home ?? '-'
  const htAway = score.halftime.away ?? '-'

  return (
    <div style={{ minHeight: '100vh', background: '#111827', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
      />
      <div className={`main ${sidebarOpen ? '' : 'sidebar-closed'}`} style={{ display: 'flex', flex: 1, background: '#111827' }}>
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="game-details-page-wrap" style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
      <div className="game-details-container" style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Sticky Back Button */}
        <div className="game-details-back-bar">
          <button
            className="game-details-back-btn"
            onClick={() => navigate('/')}
          >
            <span className="game-details-back-arrow">←</span>
            <span>Назад</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="game-details-main-card" style={{ background: '#1f2937', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
          {/* Header Section */}
          <div className="game-details-league-header" style={{ background: '#374151', padding: '16px 20px', borderBottom: '1px solid #4b5563' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p className="game-details-league-text" style={{ margin: '0', fontSize: '14px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '500' }}>
                  🌍 {league.country} • {league.name}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="game-details-round-text" style={{ margin: '0', fontSize: '13px', color: '#9ca3af' }}>Кръг {league.round}</p>
              </div>
            </div>
          </div>

          {/* Score Section */}
          <div className="game-details-score-section" style={{ padding: '30px 20px' }}>
            {/* Teams and Score Grid */}
            <div className="game-details-score-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
              {/* Home Team */}
              <div style={{ textAlign: 'center' }}>
                <img className="game-details-team-logo" src={teams.home.logo} alt={teams.home.name} style={{ width: '60px', height: '60px', marginBottom: '12px', objectFit: 'contain' }} />
                <h3 className="game-details-team-name" style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#f9fafb' }}>{teams.home.name}</h3>
              </div>

              {/* Score and Status */}
              <div style={{ textAlign: 'center' }}>
                <div className="game-details-score-number" style={{ fontSize: '48px', fontWeight: 'bold', color: '#f9fafb', letterSpacing: '4px', marginBottom: '12px' }}>
                  {goalHome} - {goalAway}
                </div>
                <p className="game-details-score-status" style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '500' }}>
                  {status.long}
                </p>
                <p className="game-details-score-halftime" style={{ margin: '0', fontSize: '11px', color: '#9ca3af' }}>
                  ПВ: {htHome} - {htAway}
                </p>
              </div>

              {/* Away Team */}
              <div style={{ textAlign: 'center' }}>
                <img className="game-details-team-logo" src={teams.away.logo} alt={teams.away.name} style={{ width: '60px', height: '60px', marginBottom: '12px', objectFit: 'contain' }} />
                <h3 className="game-details-team-name" style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#f9fafb' }}>{teams.away.name}</h3>
              </div>
            </div>

            {/* Match Date and Time */}
            <div style={{ textAlign: 'center', paddingBottom: '24px', borderBottom: '1px solid #374151' }}>
              <p className="game-details-match-datetime" style={{ margin: '0', fontSize: '13px', color: '#9ca3af' }}>
                {new Date(fixtureInfo.date).toLocaleDateString()} • {new Date(fixtureInfo.date).toLocaleTimeString()}
              </p>
            </div>

            {/* Match Info */}
            <div className="game-details-info-grid" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p className="game-details-info-label" style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>🏟️ Стадион</p>
                <p className="game-details-info-value" style={{ margin: '0', fontSize: '13px', color: '#f9fafb', fontWeight: '500' }}>{fixture.fixture.venue?.name || 'Н/Д'}</p>
              </div>
              <div>
                <p className="game-details-info-label" style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>👨‍⚖️ Съдия</p>
                <p className="game-details-info-value" style={{ margin: '0', fontSize: '13px', color: '#f9fafb', fontWeight: '500' }}>{fixture.fixture.referee || 'Н/Д'}</p>
              </div>
            </div>
          </div>

          {/* Tab Menu */}
          <div className="game-details-tabs-container" style={{ display: 'flex', gap: '0', borderTop: '1px solid #374151', background: '#111827' }}>
            {(['overview', 'statistics', 'lineups'] as TabType[]).map((tab) => {
              const labels: Record<TabType, string> = { overview: 'Преглед', statistics: 'Статистика', lineups: 'Състави' }
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  className="game-details-tab-btn"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: isActive ? '#22c55e' : 'transparent',
                    color: isActive ? '#111827' : '#9ca3af',
                    border: 'none',
                    borderLeft: tab !== 'overview' ? '1px solid #374151' : 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) { e.currentTarget.style.background = '#374151'; e.currentTarget.style.color = '#f9fafb' }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af' }
                  }}
                >
                  {labels[tab]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content - Overview */}
        {activeTab === 'overview' && (
          <div className="game-details-tab-content" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Full Events Timeline */}
            {fixture.events && fixture.events.length > 0 ? (
              <div className="game-details-section-card" style={{ background: '#1f2937', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
                <div className="game-details-section-header" style={{ background: '#374151', padding: '16px 24px', borderBottom: '1px solid #4b5563' }}>
                  <h3 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#f9fafb' }}>⚽ Събития от мача</h3>
                </div>
                <div className="game-details-section-body" style={{ padding: '24px' }}>
                  {(() => {
                    const firstHalf = (fixture.events || []).filter(e => (e.time.elapsed || 0) <= 45);
                    const secondHalf = (fixture.events || []).filter(e => (e.time.elapsed || 0) > 45);

                    const eventHalves = [
                      { name: '1-ВО ПОЛУВРЕМЕ', events: firstHalf },
                      { name: '2-РО ПОЛУВРЕМЕ', events: secondHalf }
                    ];

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {eventHalves.map((half, halfIdx) => (
                          half.events.length > 0 && (
                            <div key={halfIdx}>
                              {/* Half Header */}
                              <div style={{ background: '#374151', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px' }}>
                                <p className="game-details-half-header" style={{ margin: '0', fontSize: '12px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  {half.name}
                                </p>
                              </div>

                              {/* Events Grid - Left (Home) and Right (Away) */}
                              <div className="game-details-events-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {/* Left side - Home team events */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  {half.events
                                    .filter(e => e.team.id === teams.home.id)
                                    .map((event, idx) => (
                                      <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                                        {/* Event Details - Aligned Right */}
                                        <div style={{ textAlign: 'right', flex: 1 }}>
                                          <p className="game-details-event-player" style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: '600', color: '#f9fafb' }}>
                                            {event.player?.name || 'Играч'}
                                          </p>
                                          <p className="game-details-event-detail" style={{ margin: '0', fontSize: '11px', color: '#9ca3af' }}>
                                            {event.type === 'Goal' ? '⚽ Гол' : event.type === 'Card' ? (event.detail === 'Red Card' ? '🟥 Червен картон' : '🟨 Жълт картон') : (event.type === 'Subst' || event.type === 'subst') ? `🔄 ${(event.detail || '').replace(/Substitution/i, 'Смяна')}` : (event.detail || '').replace(/Substitution/i, 'Смяна')}
                                          </p>
                                        </div>

                                        {/* Icon and Time */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                          <div className="game-details-event-icon" style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: event.type === 'Goal' ? '#22c55e' : event.type === 'Card' ? (event.detail === 'Red Card' ? '#ef4444' : '#facc15') : '#3b82f6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            color: event.type === 'Card' && event.detail !== 'Red Card' ? '#111827' : 'white'
                                          }}>
                                            {event.type === 'Goal' ? '⚽' : event.type === 'Card' ? (event.detail === 'Red Card' ? '🟥' : '🟨') : '🔄'}
                                          </div>
                                          <p style={{ margin: '0', fontSize: '12px', fontWeight: 'bold', color: '#9ca3af' }}>{event.time.elapsed}'</p>
                                        </div>
                                      </div>
                                    ))}
                                </div>

                                {/* Right side - Away team events */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  {half.events
                                    .filter(e => e.team.id === teams.away.id)
                                    .map((event, idx) => (
                                      <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                                        {/* Icon and Time */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                          <div className="game-details-event-icon" style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: event.type === 'Goal' ? '#22c55e' : event.type === 'Card' ? (event.detail === 'Red Card' ? '#ef4444' : '#facc15') : '#3b82f6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            color: event.type === 'Card' && event.detail !== 'Red Card' ? '#111827' : 'white'
                                          }}>
                                            {event.type === 'Goal' ? '⚽' : event.type === 'Card' ? (event.detail === 'Red Card' ? '🟥' : '🟨') : '🔄'}
                                          </div>
                                          <p style={{ margin: '0', fontSize: '12px', fontWeight: 'bold', color: '#9ca3af' }}>{event.time.elapsed}'</p>
                                        </div>

                                        {/* Event Details - Aligned Left */}
                                        <div style={{ flex: 1 }}>
                                          <p className="game-details-event-player" style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: '600', color: '#f9fafb' }}>
                                            {event.player?.name || 'Играч'}
                                          </p>
                                          <p className="game-details-event-detail" style={{ margin: '0', fontSize: '11px', color: '#9ca3af' }}>
                                            {event.type === 'Goal' ? '⚽ Гол' : event.type === 'Card' ? (event.detail === 'Red Card' ? '🟥 Червен картон' : '🟨 Жълт картон') : (event.type === 'Subst' || event.type === 'subst') ? `🔄 ${(event.detail || '').replace(/Substitution/i, 'Смяна')}` : (event.detail || '').replace(/Substitution/i, 'Смяна')}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="game-details-section-card" style={{ background: '#1f2937', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#9ca3af' }}>⚽ Няма записани събития</p>
                <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>Няма налични събития за този мач все още.</p>
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <div className="game-details-tab-content" style={{ marginTop: '24px', background: '#1f2937', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
            {fixture.statistics && fixture.statistics.length > 0 ? (
              <MatchStatistics statistics={fixture.statistics} />
            ) : downloadingStats ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #374151', borderTop: '3px solid #22c55e', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                <p style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#9ca3af' }}>📊 Зареждане на статистика...</p>
                <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>Данните се изтеглят от API.</p>
              </div>
            ) : (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#9ca3af' }}>📊 Няма налична статистика</p>
                <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>Статистиката за този мач не е налична в момента.</p>
              </div>
            )}
          </div>
        )}

        {/* Lineups Tab */}
        {activeTab === 'lineups' && (
          <div className="game-details-lineups-card" style={{ marginTop: '24px', background: '#1f2937', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', padding: '32px' }}>
            {fixture.lineups && fixture.lineups.length > 0 ? (
            <>
            {/* Formation Header */}
            <div className="game-details-formation-header" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '32px', alignItems: 'center' }}>
              <div style={{ textAlign: 'left' }}>
                <p className="game-details-formation-label" style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Формация</p>
                <p className="game-details-formation-number" style={{ margin: '0', fontSize: '24px', fontWeight: '800', color: '#ffffff' }}>{fixture.lineups[0]?.formation}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p className="game-details-formation-title" style={{ margin: '0', fontSize: '13px', color: '#d1d5db', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px' }}>Състави</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="game-details-formation-label" style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Формация</p>
                <p className="game-details-formation-number" style={{ margin: '0', fontSize: '24px', fontWeight: '800', color: '#ffffff' }}>{fixture.lineups[1]?.formation}</p>
              </div>
            </div>

            {/* Main Pitch Card */}
            <div className="game-details-pitch-card" style={{ position: 'relative', width: '100%', maxWidth: '1000px', margin: '0 auto 32px', background: '#111827', borderRadius: '16px', border: '2px solid #374151', overflow: 'visible', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)', padding: '40px' }}>
              {/* Pitch SVG - Professional Football Stadium */}
              <svg style={{ position: 'relative', width: '100%', maxWidth: '100%', height: 'auto', display: 'block' }} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid meet">
                {/* Pitch background */}
                <rect width="1200" height="800" fill="#2d5016" />
                
                {/* Outer border with rounded corners - Stadium look */}
                <rect x="20" y="20" width="1160" height="760" rx="24" ry="24" fill="none" stroke="#ffffff" strokeWidth="3" opacity="1" />

                {/* === CORNER ARCS === */}
                {/* Top-left corner arc */}
                <path d="M 55 20 A 30 30 0 0 1 20 55" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="1" />
                
                {/* Top-right corner arc */}
                <path d="M 1145 20 A 30 30 0 0 0 1180 55" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="1" />
                
                {/* Bottom-left corner arc */}
                <path d="M 20 745 A 30 30 0 0 1 55 780" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="1" />
                
                {/* Bottom-right corner arc */}
                <path d="M 1180 745 A 30 30 0 0 0 1145 780" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="1" />

                {/* Halfway line - Vertical center */}
                <line x1="600" y1="20" x2="600" y2="780" stroke="#ffffff" strokeWidth="2.5" opacity="1" />

                {/* Center circle */}
                <circle cx="600" cy="400" r="90" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="1" />
                {/* Center spot */}
                <circle cx="600" cy="400" r="4" fill="#ffffff" opacity="1" />

                {/* === LEFT SIDE PENALTY AREAS === */}
                {/* Left penalty box */}
                <rect x="20" y="240" width="180" height="320" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="1" />
                {/* Left 6-yard box */}
                <rect x="20" y="320" width="80" height="160" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="1" />

                {/* === RIGHT SIDE PENALTY AREAS === */}
                {/* Right penalty box */}
                <rect x="1000" y="240" width="180" height="320" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="1" />
                {/* Right 6-yard box */}
                <rect x="1100" y="320" width="80" height="160" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="1" />

                {/* === PENALTY SPOTS === */}
                {/* Top penalty spot */}
                <circle cx="600" cy="100" r="4" fill="#ffffff" opacity="1" />
                
                {/* Bottom penalty spot */}
                <circle cx="600" cy="720" r="4" fill="#ffffff" opacity="1" />
              </svg>

              {/* Team Average Rating Boxes */}
              {fixture.lineups.map((lineup, teamIdx) => {
                // Calculate average rating for this team
                const allRatings = lineup.startXI.map(player => {
                  const baseRating = 6.5 + ((player.player.id % 25) / 10); // Deterministic based on player ID
                  return parseFloat(baseRating.toFixed(1));
                });
                const avgRating = (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1);
                return (
                  <div className="game-details-avg-rating" key={`avg-${teamIdx}`} style={{ position: 'absolute', top: '80px', [teamIdx === 0 ? 'left' : 'right']: '80px', zIndex: 10, background: teamIdx === 0 ? '#003da5' : '#FF6B35', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    {avgRating}
                  </div>
                );
              })}

              {/* Players on Pitch */}
              <div className="game-details-pitch-players" style={{ position: 'absolute', top: '40px', left: '40px', width: 'calc(100% - 80px)', height: 'calc(100% - 80px)' }}>
                {fixture.lineups.map((lineup, teamIdx) => {
                  const isHome = teamIdx === 0;
                  const positionsByRole: { [key: string]: any[] } = {
                    GK: [],
                    DEF: [],
                    MID: [],
                    FWD: []
                  };

                  lineup.startXI.forEach((player) => {
                    const pos = player.player.pos;
                    if (pos === 'G' || pos === 'GK') positionsByRole.GK.push(player);
                    else if (pos === 'D' || pos === 'CB' || pos === 'LB' || pos === 'RB') positionsByRole.DEF.push(player);
                    else if (pos === 'M' || pos === 'CM' || pos === 'LM' || pos === 'RM' || pos === 'CDM' || pos === 'CAM' || pos === 'AM') positionsByRole.MID.push(player);
                    else positionsByRole.FWD.push(player);
                  });

                  const getFormationPositions = (formation: string) => {
                    const formationMap: { [key: string]: { GK: any; DEF: any; MID: any; FWD: any } } = {
                      '3-4-3': { 
                        GK: [[4, 50]], 
                        DEF: [[14, 25], [14, 50], [14, 75]], 
                        MID: [[26, 15], [26, 38], [26, 62], [26, 85]], 
                        FWD: [[38, 20], [38, 50], [38, 80]] 
                      },
                      '4-2-3-1': { 
                        GK: [[4, 50]], 
                        DEF: [[14, 20], [14, 40], [14, 60], [14, 80]], 
                        MID: [[25, 35], [25, 65], [32, 22], [32, 50], [32, 78]], 
                        FWD: [[40, 50]] 
                      },
                      '4-3-3': { 
                        GK: [[4, 50]], 
                        DEF: [[14, 20], [14, 40], [14, 60], [14, 80]], 
                        MID: [[26, 22], [26, 50], [26, 78]], 
                        FWD: [[38, 18], [38, 50], [38, 82]] 
                      },
                      '5-3-2': { 
                        GK: [[4, 50]], 
                        DEF: [[13, 14], [13, 32], [13, 50], [13, 68], [13, 86]], 
                        MID: [[26, 25], [26, 50], [26, 75]], 
                        FWD: [[38, 35], [38, 65]] 
                      },
                      '4-4-2': { 
                        GK: [[4, 50]], 
                        DEF: [[14, 20], [14, 40], [14, 60], [14, 80]], 
                        MID: [[26, 18], [26, 40], [26, 60], [26, 82]], 
                        FWD: [[38, 35], [38, 65]] 
                      },
                      '3-5-2': { 
                        GK: [[4, 50]], 
                        DEF: [[14, 25], [14, 50], [14, 75]], 
                        MID: [[26, 14], [26, 32], [26, 50], [26, 68], [26, 86]], 
                        FWD: [[38, 35], [38, 65]] 
                      }
                    };
                    return formationMap[formation] || formationMap['4-3-3'];
                  };

                  const positions = getFormationPositions(lineup.formation);

                  const getRating = (playerId: number) => {
                    const baseRating = 6.5 + ((playerId % 25) / 10); // Deterministic based on player ID
                    return baseRating.toFixed(1);
                  };

                  const renderPlayer = (player: any, x: number, y: number, role: string) => {
                    const surname = player.player.name.split(' ').pop();
                    const rating = getRating(player.player.id);
                    const ratingColor = parseFloat(rating) >= 7.5 ? '#10b981' : parseFloat(rating) >= 7 ? '#f59e0b' : '#ef4444';

                    return (
                      <div key={`${role}-${player.player.number}`} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', cursor: 'pointer', zIndex: 5 }}>
                        {/* Player Circle */}
                        <div style={{ position: 'relative' }}>
                          <div className="game-details-player-circle" style={{ width: '28px', height: '28px', borderRadius: '50%', background: isHome ? 'linear-gradient(135deg, #003da5 0%, #0052cc 100%)' : 'linear-gradient(135deg, #FF6B35 0%, #FF8555 100%)', border: '1.5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px', color: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { (e.currentTarget as any).style.transform = 'scale(1.15)'; (e.currentTarget as any).style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'; }} onMouseLeave={(e) => { (e.currentTarget as any).style.transform = 'scale(1)'; (e.currentTarget as any).style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)'; }}>{player.player.number}</div>
                          {/* Rating Badge */}
                          <div className="game-details-rating-badge" style={{ position: 'absolute', top: '-8px', right: '-8px', background: ratingColor, color: 'white', padding: '1px 4px', borderRadius: '8px', fontSize: '8px', fontWeight: '700', border: '1.5px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            {rating}
                          </div>
                        </div>
                        {/* Player Label */}
                        <div className="game-details-player-label" style={{ background: '#3a3f47', padding: '2px 6px', borderRadius: '6px', fontSize: '8px', fontWeight: '600', color: '#ffffff', whiteSpace: 'nowrap', border: '1px solid #4a4f57', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
                          {surname}
                        </div>
                      </div>
                    );
                  };

                  return (
                    <div key={teamIdx}>
                      {positionsByRole.GK.map((player, idx) => {
                        const [x, y] = positions.GK[idx] || [50, 50];
                        const xPos = isHome ? x : 100 - x;
                        return renderPlayer(player, xPos, y, 'GK');
                      })}
                      {positionsByRole.DEF.map((player, idx) => {
                        const [x, y] = positions.DEF[idx] || [35, 50];
                        const xPos = isHome ? x : 100 - x;
                        return renderPlayer(player, xPos, y, 'DEF');
                      })}
                      {positionsByRole.MID.map((player, idx) => {
                        const [x, y] = positions.MID[idx] || [50, 50];
                        const xPos = isHome ? x : 100 - x;
                        return renderPlayer(player, xPos, y, 'MID');
                      })}
                      {positionsByRole.FWD.map((player, idx) => {
                        const [x, y] = positions.FWD[idx] || [70, 50];
                        const xPos = isHome ? x : 100 - x;
                        return renderPlayer(player, xPos, y, 'FWD');
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Substitutes Section */}
            <div style={{ marginTop: '32px' }}>
              <h3 className="game-details-subs-header" style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#d1d5db', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '1px' }}>Резервни играчи</h3>
              
              <div className="game-details-subs-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                {fixture.lineups.map((lineup, idx) => (
                  <div key={idx}>
                    {/* Team Name */}
                    <div className="game-details-subs-team-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', justifyContent: idx === 0 ? 'flex-start' : 'flex-end' }}>
                      <img src={lineup.team.logo} alt={lineup.team.name} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                      <h4 style={{ margin: '0', fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>
                        {lineup.team.name}
                      </h4>
                    </div>

                    {/* Substitute Players */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {lineup.substitutes && lineup.substitutes.slice(0, 6).map((player, pidx) => {
                        return (
                          <div
                            key={pidx}
                            className="game-details-sub-card"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px',
                            background: '#374151',
                            borderRadius: '12px',
                            border: '1px solid #4b5563',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#4b5563';
                            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#374151';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            {/* Player Number Circle */}
                            <div className="game-details-sub-circle" style={{ width: '32px', height: '32px', borderRadius: '50%', background: idx === 0 ? '#003da5' : '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: 'white', flexShrink: 0 }}>
                              {player.player.number}
                            </div>

                            {/* Player Name */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p className="game-details-sub-name" style={{ margin: '0', fontSize: '12px', fontWeight: '600', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {player.player.name}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </>
            ) : downloadingStats ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #374151', borderTop: '3px solid #22c55e', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                <p style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#9ca3af' }}>👥 Зареждане на състави...</p>
                <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>Данните се изтеглят от API.</p>
              </div>
            ) : (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#9ca3af' }}>👥 Няма налични състави</p>
                <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>Съставите за този мач не са налични в момента.</p>
              </div>
            )}
          </div>
        )}
      </div>
        </div>
        <aside className="rightpane" aria-label="Right pane">
          <div className="rightpane-inner">
            <FeaturedMatch />
          </div>
        </aside>
      </div>
      <BottomNavbar />
    </div>
  )
}
