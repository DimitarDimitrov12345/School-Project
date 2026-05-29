import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import BottomNavbar from '../components/BottomNavbar'
import FeaturedMatch from '../components/FeaturedMatch'
import { useAuth } from '../contexts/AuthContext'
import '../styles/profileAndPredictions.css'

type FixtureItem = {
  fixture: { id: number; date: string; status?: { short?: string; long?: string } }
  teams: {
    home: { name: string; logo: string }
    away: { name: string; logo: string }
  }
  league: { id?: number; name: string; country: string }
  goals?: { home: number | null; away: number | null }
}

type PredictionMap = Record<string, { home: number; away: number }>

const getTodayKey = () => new Date().toISOString().split('T')[0]
const MAX_PREDICTION_MATCHES = 15
const TOP5_LEAGUE_IDS = [39, 140, 135, 78, 61] // EPL, La Liga, Serie A, Bundesliga, Ligue 1
const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN'])

function prioritizeFixtures(list: FixtureItem[]) {
  const sorted = [...list].sort(
    (a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
  )

  const topLeagues = sorted.filter((f) => f.league.id && TOP5_LEAGUE_IDS.includes(f.league.id))
  const otherLeagues = sorted.filter((f) => !f.league.id || !TOP5_LEAGUE_IDS.includes(f.league.id))

  return [...topLeagues, ...otherLeagues].slice(0, MAX_PREDICTION_MATCHES)
}

export default function PredictionsGamePage() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [fixtures, setFixtures] = useState<FixtureItem[]>([])
  const [fetchError, setFetchError] = useState('')
  const [predictions, setPredictions] = useState<PredictionMap>({})
  const [savedMessage, setSavedMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submittedAt, setSubmittedAt] = useState<string | null>(null)

  const storageKey = useMemo(() => `predictions_game_${getTodayKey()}_${profile?.id ?? 'guest'}`, [profile?.id])
  const submittedKey = `${storageKey}_submitted`
  const submittedAtKey = `${storageKey}_submitted_at`

  const loadFixtures = useCallback(async () => {
    setFetchError('')
    const date = getTodayKey()

    try {
      let data: any = null
      const apiRes = await fetch(`/api/saved-fixtures?date=${date}`)
      if (apiRes.ok) {
        data = await apiRes.json()
      } else {
        const staticRes = await fetch(`/saved-fixtures/fixtures_${date}.json`)
        if (staticRes.ok) {
          data = await staticRes.json()
        }
      }

      const list = (data?.response ?? []) as FixtureItem[]
      setFixtures(prioritizeFixtures(list))
    } catch {
      setFetchError('Неуспешно зареждане на мачовете за прогнози.')
    }
  }, [])

  useEffect(() => {
    if (!loading && (!user || !profile)) return
    loadFixtures()
  }, [loading, user, profile, loadFixtures])

  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        setPredictions(JSON.parse(stored))
      } catch {
        setPredictions({})
      }
    }

    const isSubmitted = localStorage.getItem(submittedKey) === 'true'
    setSubmitted(isSubmitted)
    setSubmittedAt(localStorage.getItem(submittedAtKey))
  }, [storageKey, submittedAtKey, submittedKey])

  useEffect(() => {
    if (!submitted) return

    const interval = setInterval(() => {
      loadFixtures()
    }, 60000)

    return () => clearInterval(interval)
  }, [submitted, loadFixtures])

  if (!loading && (!user || !profile)) {
    return <Navigate to="/login" replace />
  }

  const setPredictionValue = (fixtureId: number, side: 'home' | 'away', value: string) => {
    if (submitted) return

    const parsed = Number(value)
    const next = Number.isFinite(parsed) ? Math.max(0, Math.min(20, parsed)) : 0
    setPredictions((prev) => ({
      ...prev,
      [String(fixtureId)]: {
        home: side === 'home' ? next : prev[String(fixtureId)]?.home ?? 0,
        away: side === 'away' ? next : prev[String(fixtureId)]?.away ?? 0,
      },
    }))
  }

  const submitPredictions = () => {
    if (Object.keys(predictions).length === 0) {
      setFetchError('Добави поне една прогноза преди изпращане.')
      return
    }

    localStorage.setItem(storageKey, JSON.stringify(predictions))
    localStorage.setItem(submittedKey, 'true')
    const now = new Date().toISOString()
    localStorage.setItem(submittedAtKey, now)
    setSubmitted(true)
    setSubmittedAt(now)
    setSavedMessage('Прогнозите са изпратени. Системата ще ги провери след края на мачовете.')
    setTimeout(() => setSavedMessage(''), 2500)
  }

  const getPredictionStatus = (item: FixtureItem) => {
    const prediction = predictions[String(item.fixture.id)]
    const shortStatus = item.fixture.status?.short ?? ''
    const isFinished = FINISHED_STATUSES.has(shortStatus)
    const homeGoals = item.goals?.home
    const awayGoals = item.goals?.away

    if (!submitted) {
      return { label: 'Неизпратено', cls: 'prediction-badge neutral', points: 0 }
    }

    if (!prediction) {
      return { label: 'Без прогноза', cls: 'prediction-badge neutral', points: 0 }
    }

    if (!isFinished || homeGoals == null || awayGoals == null) {
      return { label: 'Изчаква резултат', cls: 'prediction-badge waiting', points: 0 }
    }

    const exact = prediction.home === homeGoals && prediction.away === awayGoals
    if (exact) {
      return { label: 'Познал точно (+3)', cls: 'prediction-badge hit', points: 3 }
    }

    const predictedOutcome = Math.sign(prediction.home - prediction.away)
    const actualOutcome = Math.sign(homeGoals - awayGoals)
    if (predictedOutcome === actualOutcome) {
      return { label: 'Познал изход (+1)', cls: 'prediction-badge partial', points: 1 }
    }

    return { label: 'Непознато (0)', cls: 'prediction-badge miss', points: 0 }
  }

  const summary = fixtures.reduce(
    (acc, item) => {
      const status = getPredictionStatus(item)
      if (status.label.includes('Изчаква')) acc.waiting += 1
      if (status.points > 0) acc.correct += 1
      acc.points += status.points
      return acc
    },
    { points: 0, correct: 0, waiting: 0 }
  )

  return (
    <div className="app layout">
      <Navbar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
      />
      <div className={`main ${sidebarOpen ? '' : 'sidebar-closed'}`}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="content profile-page-content">
          <div className="predictions-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0 }}>Игра с прогнози</h1>
              <button className="profile-secondary-btn" onClick={() => navigate('/')}>
                Към начало
              </button>
            </div>
            <p className="profile-subtitle">Дай прогноза за днешните мачове и я запази.</p>

            {submitted && (
              <div className="prediction-summary">
                <span>Общо точки: <strong>{summary.points}</strong></span>
                <span>Познати: <strong>{summary.correct}</strong></span>
                <span>Чакащи: <strong>{summary.waiting}</strong></span>
                {submittedAt && <span>Изпратени: <strong>{new Date(submittedAt).toLocaleString()}</strong></span>}
              </div>
            )}

            {fetchError && <div className="profile-error">{fetchError}</div>}
            {savedMessage && <div className="profile-success">{savedMessage}</div>}

            <div className="predictions-list">
              {fixtures.map((item) => {
                const key = String(item.fixture.id)
                const current = predictions[key] ?? { home: 0, away: 0 }

                return (
                  <div key={item.fixture.id} className="prediction-row">
                    <div className="prediction-match-meta">
                      <div className="prediction-league">{item.league.country} • {item.league.name}</div>
                      <div className="prediction-time-wrap">
                        <div className="prediction-time">{new Date(item.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <span className={getPredictionStatus(item).cls}>{getPredictionStatus(item).label}</span>
                      </div>
                    </div>

                    <div className="prediction-teams">
                      <span className="team-name">{item.teams.home.name}</span>
                      <div className="prediction-input-wrap">
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={current.home}
                          onChange={(e) => setPredictionValue(item.fixture.id, 'home', e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          className="prediction-score-input"
                          disabled={submitted}
                        />
                        <span className="score-sep">:</span>
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={current.away}
                          onChange={(e) => setPredictionValue(item.fixture.id, 'away', e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          className="prediction-score-input"
                          disabled={submitted}
                        />
                      </div>
                      <span className="team-name team-right">{item.teams.away.name}</span>
                    </div>
                  </div>
                )
              })}

              {!fixtures.length && !fetchError && (
                <div className="profile-subtitle">Няма налични мачове за днес.</div>
              )}
            </div>

            <div className="prediction-actions">
              <button className="profile-save-btn" onClick={submitPredictions} disabled={submitted}>
                {submitted ? 'Прогнозите са изпратени' : 'Изпрати прогнози'}
              </button>
              <button className="profile-secondary-btn" onClick={() => navigate('/')}>
                Към начало
              </button>
            </div>
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
