import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/gamesWidget.css'

interface GamesWidgetProps {
  tab: 'ДНЕС' | 'УТРЕ' | 'ВЧЕРА'
}

interface FixtureData {
  fixture: { id: number; date: string; timestamp: number; status: { short: string; long: string; elapsed: number | null } }
  league: { id: number; name: string; country: string; flag: string; round: string; season: number }
  teams: { home: { id: number; name: string; logo: string }; away: { id: number; name: string; logo: string } }
  goals: { home: number | null; away: number | null }
  score: { halftime: { home: number | null; away: number | null } }
}

const TOP_LEAGUE_IDS = [2, 3, 848, 39, 140, 135, 78, 61]
const LIVE = ['1H', '2H', 'ET', 'P', 'LIVE']
const BREAK = ['HT', 'BT']
const FINISHED = ['FT', 'AET', 'PEN']

function formatTime(ts: number) {
  const d = new Date(ts * 1000)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

const GamesWidget: React.FC<GamesWidgetProps> = ({ tab }) => {
  const navigate = useNavigate()
  const [grouped, setGrouped] = useState<Record<string, { league: FixtureData['league']; fixtures: FixtureData[] }>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'finished' | 'scheduled'>('all')

  const getDateForTab = (tabName: 'ДНЕС' | 'УТРЕ' | 'ВЧЕРА'): string => {
    const today = new Date()
    const date = new Date(today)
    if (tabName === 'УТРЕ') date.setDate(today.getDate() + 1)
    else if (tabName === 'ВЧЕРА') date.setDate(today.getDate() - 1)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const selectedDate = getDateForTab(tab)

  const fetchFixtures = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let data: any
      // Try API endpoint first (works on Vercel), fallback to static file (local dev)
      const res = await fetch(`/api/saved-fixtures?date=${selectedDate}`)
      if (res.ok) {
        data = await res.json()
      } else {
        const fallback = await fetch(`/saved-fixtures/fixtures_${selectedDate}.json`)
        if (!fallback.ok) throw new Error('not found')
        data = await fallback.json()
      }
      if (!data.response || data.response.length === 0) {
        setGrouped({})
        setLoading(false)
        return
      }

      // Sort by timestamp
      data.response.sort((a: FixtureData, b: FixtureData) => a.fixture.timestamp - b.fixture.timestamp)

      // Group by league
      const groups: Record<string, { league: FixtureData['league']; fixtures: FixtureData[] }> = {}
      for (const f of data.response as FixtureData[]) {
        const key = `league-${f.league.id}`
        if (!groups[key]) groups[key] = { league: f.league, fixtures: [] }
        groups[key].fixtures.push(f)
      }

      // Sort leagues: top leagues first
      const sorted: typeof groups = {}
      const keys = Object.keys(groups).sort((a, b) => {
        const aId = groups[a].league.id
        const bId = groups[b].league.id
        const aIdx = TOP_LEAGUE_IDS.indexOf(aId)
        const bIdx = TOP_LEAGUE_IDS.indexOf(bId)
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
        if (aIdx !== -1) return -1
        if (bIdx !== -1) return 1
        return 0
      })
      for (const k of keys) sorted[k] = groups[k]

      setGrouped(sorted)
    } catch {
      setError('Няма налични мачове')
      setGrouped({})
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => { fetchFixtures() }, [fetchFixtures])

  const handleClick = (f: FixtureData) => {
    try { localStorage.setItem('selectedFixture', JSON.stringify(f)) } catch {}
    navigate(`/game/${f.fixture.id}`)
  }

  const filterMatch = (f: FixtureData) => {
    if (filter === 'finished') return FINISHED.includes(f.fixture.status.short)
    if (filter === 'scheduled') return f.fixture.status.short === 'NS'
    return true
  }

  if (loading) {
    return <div className="gw-container"><div className="gw-loading">Зареждане...</div></div>
  }

  if (error || Object.keys(grouped).length === 0) {
    return <div className="gw-container"><div className="gw-empty">Няма налични мачове</div></div>
  }

  return (
    <div className="gw-container">
      <div className="gw-toolbar">
        {(['all', 'finished', 'scheduled'] as const).map(f => (
          <button key={f} className={`gw-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'ВСИЧКИ' : f === 'finished' ? 'ЗАВЪРШИЛИ' : 'ПРЕДСТОЯЩИ'}
          </button>
        ))}
      </div>

      {Object.values(grouped).map(({ league, fixtures }) => {
        const visible = fixtures.filter(filterMatch)
        if (visible.length === 0) return null
        return (
          <div key={league.id} className="gw-league">
            <div className="gw-league-header">
              {league.flag && <img src={league.flag} alt="" className="gw-flag" loading="lazy" />}
              <span>{league.country}: {league.name}</span>
            </div>
            {visible.map(f => {
              const st = f.fixture.status.short
              const isLive = LIVE.includes(st)
              const isBreak = BREAK.includes(st)
              const isFinished = FINISHED.includes(st)
              const statusClass = isLive ? 'gw-live' : isBreak ? 'gw-break' : isFinished ? 'gw-finished' : ''
              const statusText = st === 'NS' ? formatTime(f.fixture.timestamp) : isLive && f.fixture.status.elapsed ? `${f.fixture.status.elapsed}'` : st

              return (
                <div key={f.fixture.id} className="gw-match" onClick={() => handleClick(f)}>
                  <div className={`gw-status ${statusClass}`}>{statusText}</div>
                  <div className="gw-teams">
                    <div className="gw-team"><img src={f.teams.home.logo} alt="" className="gw-logo" loading="lazy" /><span>{f.teams.home.name}</span></div>
                    <div className="gw-team"><img src={f.teams.away.logo} alt="" className="gw-logo" loading="lazy" /><span>{f.teams.away.name}</span></div>
                  </div>
                  <div className={`gw-score ${isLive ? 'gw-live' : ''}`}>
                    <span>{f.goals.home ?? '-'}</span>
                    <span>{f.goals.away ?? '-'}</span>
                  </div>
                  <div className="gw-ht">
                    <span>{f.score.halftime.home != null ? `(${f.score.halftime.home})` : ''}</span>
                    <span>{f.score.halftime.away != null ? `(${f.score.halftime.away})` : ''}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default GamesWidget
