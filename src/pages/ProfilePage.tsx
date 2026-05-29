import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import BottomNavbar from '../components/BottomNavbar'
import FeaturedMatch from '../components/FeaturedMatch'
import { useAuth } from '../contexts/AuthContext'
import '../styles/profileAndPredictions.css'

type SavedFixtureItem = {
  fixture: { id: number; status?: { short?: string } }
  goals?: { home: number | null; away: number | null }
}

type ProfileStats = {
  points: number
  exactHits: number
  outcomeHits: number
  pending: number
  evaluated: number
}

const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN'])
const DEFAULT_STATS: ProfileStats = {
  points: 0,
  exactHits: 0,
  outcomeHits: 0,
  pending: 0,
  evaluated: 0,
}

const extractDateFromStorageKey = (key: string) => {
  const match = key.match(/^predictions_game_(\d{4}-\d{2}-\d{2})_/)
  return match?.[1] ?? null
}

export default function ProfilePage() {
  const { user, profile, loading, updateProfile } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentUsername, setCurrentUsername] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [stats, setStats] = useState<ProfileStats>(DEFAULT_STATS)

  useEffect(() => {
    if (profile) {
      setCurrentUsername(profile.username ?? '')
      setNewUsername('')
    }
  }, [profile])

  useEffect(() => {
    if (!profile?.id) {
      setStats(DEFAULT_STATS)
      return
    }

    let cancelled = false

    const loadProfileStats = async () => {
      const predictionKeys = Object.keys(localStorage).filter(
        (key) =>
          key.startsWith('predictions_game_') &&
          key.endsWith(`_${profile.id}`) &&
          !key.endsWith('_submitted') &&
          !key.endsWith('_submitted_at')
      )

      const submittedKeys = predictionKeys.filter((key) => localStorage.getItem(`${key}_submitted`) === 'true')

      if (!submittedKeys.length) {
        if (!cancelled) setStats(DEFAULT_STATS)
        return
      }

      const dates = Array.from(
        new Set(submittedKeys.map((key) => extractDateFromStorageKey(key)).filter((v): v is string => Boolean(v)))
      )

      const fixturesByDate = new Map<string, SavedFixtureItem[]>()

      await Promise.all(
        dates.map(async (date) => {
          try {
            let data: any = null
            const apiRes = await fetch(`/api/saved-fixtures?date=${date}`)
            if (apiRes.ok) {
              data = await apiRes.json()
            } else {
              const staticRes = await fetch(`/saved-fixtures/fixtures_${date}.json`)
              if (staticRes.ok) data = await staticRes.json()
            }

            fixturesByDate.set(date, (data?.response ?? []) as SavedFixtureItem[])
          } catch {
            fixturesByDate.set(date, [])
          }
        })
      )

      const computed = submittedKeys.reduce<ProfileStats>((acc, key) => {
        const date = extractDateFromStorageKey(key)
        if (!date) return acc

        let parsed: Record<string, { home: number; away: number }> = {}
        try {
          parsed = JSON.parse(localStorage.getItem(key) ?? '{}')
        } catch {
          parsed = {}
        }

        const fixtures = fixturesByDate.get(date) ?? []
        const fixtureMap = new Map(fixtures.map((f) => [String(f.fixture.id), f]))
        Object.entries(parsed).forEach(([fixtureId, prediction]) => {
          const item = fixtureMap.get(fixtureId)
          const shortStatus = item?.fixture.status?.short ?? ''
          const homeGoals = item?.goals?.home
          const awayGoals = item?.goals?.away

          if (!item || !FINISHED_STATUSES.has(shortStatus) || homeGoals == null || awayGoals == null) {
            acc.pending += 1
            return
          }

          acc.evaluated += 1

          const exact = prediction.home === homeGoals && prediction.away === awayGoals
          if (exact) {
            acc.exactHits += 1
            acc.points += 3
            return
          }

          const predictedOutcome = Math.sign(prediction.home - prediction.away)
          const actualOutcome = Math.sign(homeGoals - awayGoals)
          if (predictedOutcome === actualOutcome) {
            acc.outcomeHits += 1
            acc.points += 1
          }
        })

        return acc
      }, { ...DEFAULT_STATS })

      if (!cancelled) {
        setStats(computed)
      }
    }

    loadProfileStats()

    return () => {
      cancelled = true
    }
  }, [profile?.id])

  if (!loading && (!user || !profile)) {
    return <Navigate to="/login" replace />
  }

  const onSave = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')

    const trimmedNewUsername = newUsername.trim()
    if (!trimmedNewUsername) {
      setError('Въведи ново потребителско име, ако искаш да го смениш.')
      return
    }

    if (trimmedNewUsername === (currentUsername || '').trim()) {
      setError('Новото потребителско име трябва да е различно от текущото.')
      return
    }

    setSaving(true)

    const { error: updateError } = await updateProfile({ username: trimmedNewUsername })

    if (updateError) {
      setError(updateError.message)
    } else {
      setMessage('Потребителското име е обновено успешно.')
      setCurrentUsername(trimmedNewUsername)
      setNewUsername('')
    }

    setSaving(false)
  }

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

        <div className="content profile-page-content">
          <div className="profile-card">
            <h1>Моят профил</h1>
            <p className="profile-subtitle">Email е само за преглед. Можеш да променяш само потребителското име.</p>

            <div className="profile-highlight">
              <div>
                <div className="profile-highlight-name">{profile?.username || 'Потребител'}</div>
                <div className="profile-highlight-email">{profile?.email || 'Няма email'}</div>
              </div>
              <div className="profile-highlight-points-wrap">
                <span className="profile-highlight-points-label">Точки</span>
                <strong className="profile-highlight-points">{stats.points}</strong>
              </div>
            </div>

            <div className="profile-stats-grid">
              <div className="profile-stat-card">
                <span className="profile-stat-label">Точни прогнози</span>
                <strong className="profile-stat-value">{stats.exactHits}</strong>
              </div>
              <div className="profile-stat-card">
                <span className="profile-stat-label">Познат изход</span>
                <strong className="profile-stat-value">{stats.outcomeHits}</strong>
              </div>
              <div className="profile-stat-card">
                <span className="profile-stat-label">Чакащи мачове</span>
                <strong className="profile-stat-value">{stats.pending}</strong>
              </div>
              <div className="profile-stat-card">
                <span className="profile-stat-label">Оценени прогнози</span>
                <strong className="profile-stat-value">{stats.evaluated}</strong>
              </div>
            </div>

            <form onSubmit={onSave} className="profile-form">
              <label>
                Текущо потребителско име
                <input
                  value={currentUsername}
                  className="profile-input"
                  disabled
                  readOnly
                />
              </label>

              <label>
                Ново потребителско име
                <input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="profile-input"
                  placeholder="Въведи ново име (по желание)"
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={profile?.email ?? ''}
                  className="profile-input"
                  disabled
                  readOnly
                />
              </label>

              {error && <div className="profile-error">{error}</div>}
              {message && <div className="profile-success">{message}</div>}

              <button type="submit" className="profile-save-btn" disabled={saving}>
                {saving ? 'Записване...' : 'Запази промените'}
              </button>
            </form>

            <div className="profile-options">
              <h2>Бързи опции</h2>
              <div className="profile-options-grid">
                <Link to="/predictions-game" className="profile-option-link">Към играта с прогнози</Link>
                <Link to="/" className="profile-option-link">Към началната страница</Link>
              </div>
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
