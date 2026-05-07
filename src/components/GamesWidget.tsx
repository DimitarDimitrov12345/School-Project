import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/gamesWidget.css'

interface GamesWidgetProps {
  tab: '\u0414\u041d\u0415\u0421' | '\u0423\u0422\u0420\u0415' | '\u0412\u0427\u0415\u0420\u0410'
  searchQuery?: string
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
const LABELS = {
  today: '\u0414\u041d\u0415\u0421',
  tomorrow: '\u0423\u0422\u0420\u0415',
  yesterday: '\u0412\u0427\u0415\u0420\u0410',
  all: '\u0412\u0421\u0418\u0427\u041a\u0418',
  finished: '\u0417\u0410\u0412\u042a\u0420\u0428\u0418\u041b\u0418',
  scheduled: '\u041f\u0420\u0415\u0414\u0421\u0422\u041e\u042f\u0429\u0418',
  loading: '\u0417\u0430\u0440\u0435\u0436\u0434\u0430\u043d\u0435...',
  noMatches: '\u041d\u044f\u043c\u0430 \u043d\u0430\u043b\u0438\u0447\u043d\u0438 \u043c\u0430\u0447\u043e\u0432\u0435',
  noMatchesForFilter: '\u041d\u044f\u043c\u0430 \u043c\u0430\u0447\u043e\u0432\u0435 \u0437\u0430 \u0438\u0437\u0431\u0440\u0430\u043d\u0438\u044f \u0444\u0438\u043b\u0442\u044a\u0440',
  noResultsPrefix: '\u041d\u044f\u043c\u0430 \u0440\u0435\u0437\u0443\u043b\u0442\u0430\u0442\u0438 \u0437\u0430 ',
} as const

function formatTime(ts: number) {
  const d = new Date(ts * 1000)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

const GamesWidget: React.FC<GamesWidgetProps> = ({ tab, searchQuery = '' }) => {
  const navigate = useNavigate()
  const [grouped, setGrouped] = useState<Record<string, { league: FixtureData['league']; fixtures: FixtureData[] }>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'finished' | 'scheduled'>('all')
  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase()

  const getDateForTab = (
    tabName: '\u0414\u041d\u0415\u0421' | '\u0423\u0422\u0420\u0415' | '\u0412\u0427\u0415\u0420\u0410'
  ): string => {
    const today = new Date()
    const date = new Date(today)

    if (tabName === LABELS.tomorrow) {
      date.setDate(today.getDate() + 1)
    } else if (tabName === LABELS.yesterday) {
      date.setDate(today.getDate() - 1)
    }

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const selectedDate = getDateForTab(tab)

  const fetchFixtures = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let data: { response?: FixtureData[] }

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

      data.response.sort((a, b) => a.fixture.timestamp - b.fixture.timestamp)

      const groups: Record<string, { league: FixtureData['league']; fixtures: FixtureData[] }> = {}
      for (const fixture of data.response) {
        const key = `league-${fixture.league.id}`
        if (!groups[key]) groups[key] = { league: fixture.league, fixtures: [] }
        groups[key].fixtures.push(fixture)
      }

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

      for (const key of keys) {
        sorted[key] = groups[key]
      }

      setGrouped(sorted)
    } catch {
      setError(LABELS.noMatches)
      setGrouped({})
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchFixtures()
  }, [fetchFixtures])

  const handleClick = (fixture: FixtureData) => {
    try {
      localStorage.setItem('selectedFixture', JSON.stringify(fixture))
    } catch {
      // Ignore storage failures so match navigation still works.
    }

    navigate(`/game/${fixture.fixture.id}`)
  }

  const filterMatch = (fixture: FixtureData) => {
    if (filter === 'finished') return FINISHED.includes(fixture.fixture.status.short)
    if (filter === 'scheduled') return fixture.fixture.status.short === 'NS'
    return true
  }

  const matchesSearch = (fixture: FixtureData) => {
    if (!normalizedSearchQuery) return true

    const haystack = [
      fixture.league.country,
      fixture.league.name,
      fixture.teams.home.name,
      fixture.teams.away.name,
    ]
      .join(' ')
      .toLocaleLowerCase()

    return haystack.includes(normalizedSearchQuery)
  }

  const visibleLeagues = Object.values(grouped)
    .map(({ league, fixtures }) => ({
      league,
      fixtures: fixtures.filter((fixture) => filterMatch(fixture) && matchesSearch(fixture)),
    }))
    .filter(({ fixtures }) => fixtures.length > 0)

  const emptyMessage = normalizedSearchQuery
    ? `${LABELS.noResultsPrefix}"${searchQuery.trim()}"`
    : filter !== 'all'
      ? LABELS.noMatchesForFilter
      : LABELS.noMatches

  if (loading) {
    return <div className="gw-container"><div className="gw-loading">{LABELS.loading}</div></div>
  }

  if (error || Object.keys(grouped).length === 0) {
    return <div className="gw-container"><div className="gw-empty">{LABELS.noMatches}</div></div>
  }

  return (
    <div className="gw-container">
      <div className="gw-toolbar">
        {(['all', 'finished', 'scheduled'] as const).map((value) => (
          <button
            key={value}
            className={`gw-filter-btn ${filter === value ? 'active' : ''}`}
            onClick={() => setFilter(value)}
          >
            {value === 'all' ? LABELS.all : value === 'finished' ? LABELS.finished : LABELS.scheduled}
          </button>
        ))}
      </div>

      {visibleLeagues.length === 0 && (
        <div className="gw-empty">{emptyMessage}</div>
      )}

      {visibleLeagues.map(({ league, fixtures }) => (
        <div key={league.id} className="gw-league">
          <div className="gw-league-header">
            {league.flag && <img src={league.flag} alt="" className="gw-flag" loading="lazy" />}
            <span>{league.country}: {league.name}</span>
          </div>

          {fixtures.map((fixture) => {
            const statusShort = fixture.fixture.status.short
            const isLive = LIVE.includes(statusShort)
            const isBreak = BREAK.includes(statusShort)
            const isFinished = FINISHED.includes(statusShort)
            const statusClass = isLive ? 'gw-live' : isBreak ? 'gw-break' : isFinished ? 'gw-finished' : ''
            const statusText = statusShort === 'NS'
              ? formatTime(fixture.fixture.timestamp)
              : isLive && fixture.fixture.status.elapsed
                ? `${fixture.fixture.status.elapsed}'`
                : statusShort

            return (
              <div key={fixture.fixture.id} className="gw-match" onClick={() => handleClick(fixture)}>
                <div className={`gw-status ${statusClass}`}>{statusText}</div>
                <div className="gw-teams">
                  <div className="gw-team">
                    <img src={fixture.teams.home.logo} alt="" className="gw-logo" loading="lazy" />
                    <span>{fixture.teams.home.name}</span>
                  </div>
                  <div className="gw-team">
                    <img src={fixture.teams.away.logo} alt="" className="gw-logo" loading="lazy" />
                    <span>{fixture.teams.away.name}</span>
                  </div>
                </div>
                <div className={`gw-score ${isLive ? 'gw-live' : ''}`}>
                  <span>{fixture.goals.home ?? '-'}</span>
                  <span>{fixture.goals.away ?? '-'}</span>
                </div>
                <div className="gw-ht">
                  <span>{fixture.score.halftime.home != null ? `(${fixture.score.halftime.home})` : ''}</span>
                  <span>{fixture.score.halftime.away != null ? `(${fixture.score.halftime.away})` : ''}</span>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default GamesWidget
