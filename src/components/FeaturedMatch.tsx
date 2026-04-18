import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/featuredMatch.css'

interface Fixture {
  fixture: {
    id: number
    date: string
    timestamp: number
    status: {
      short: string
      long: string
    }
  }
  league: {
    id: number
    name: string
    country: string
  }
  teams: {
    home: {
      id: number
      name: string
      logo: string
    }
    away: {
      id: number
      name: string
      logo: string
    }
  }
  goals: {
    home: number | null
    away: number | null
  }
  score: {
    halftime: {
      home: number | null
      away: number | null
    }
  }
}

const FeaturedMatch: React.FC = () => {
  const navigate = useNavigate()
  const [fixture, setFixture] = useState<Fixture | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  useEffect(() => {
    fetchRandomFixture()
    
    // Listen for fixture selection from admin
    const handleFixtureSelected = (e: CustomEvent) => {
      setFixture(e.detail)
    }
    
    window.addEventListener('fixtureSelected' as any, handleFixtureSelected)
    return () => window.removeEventListener('fixtureSelected' as any, handleFixtureSelected)
  }, [])

  const fetchRandomFixture = async () => {
    try {
      const response = await fetch('/api/fixture-random')
      const data = await response.json()
      
      if (data.success && data.fixture) {
        setFixture(data.fixture)
      } else {
        setError('Мачът не е намерен')
      }
    } catch (err) {
      console.error('Error fetching fixture:', err)
      setError('Неуспешно зареждане на мача')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!fixture) return

    const updateTimer = () => {
      const now = new Date().getTime()
      const matchTime = fixture.fixture.timestamp * 1000
      const diff = matchTime - now

      if (diff <= 0) {
        setTimeRemaining('Live')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeRemaining(`${hours}h ${minutes}m`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000)
    return () => clearInterval(interval)
  }, [fixture])

  const getStatusColor = (status: string) => {
    if (['LIVE', '1H', '2H', 'ET', 'P'].includes(status)) return 'live'
    if (['FT', 'AET', 'PEN'].includes(status)) return 'finished'
    return 'upcoming'
  }

  if (loading) {
    return (
      <div className="featured-match">
        <div style={{ padding: '20px', textAlign: 'center' }}>Зареждане...</div>
      </div>
    )
  }

  if (error || !fixture) {
    return (
      <div className="featured-match">
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          {error || 'Няма наличен мач'}
        </div>
      </div>
    )
  }

  const statusColor = getStatusColor(fixture.fixture.status.short)

  return (
    <div className="featured-match">
      <div className="featured-header">
        <h3>Мач на деня</h3>
        <span className={`status-badge status-${statusColor}`}>
          {fixture.fixture.status.short}
        </span>
      </div>

      <div className="featured-league">{fixture.league.country}: {fixture.league.name}</div>

      <div className="featured-content">
        <div className="team home-team">
          {fixture.teams.home.logo && (
            <img src={fixture.teams.home.logo} alt={fixture.teams.home.name} className="team-logo" />
          )}
          <div className="team-name">{fixture.teams.home.name}</div>
        </div>

        <div className="match-info">
          <div className="score">
            <span className="score-number">{fixture.goals.home ?? '-'}</span>
            <span className="score-separator">-</span>
            <span className="score-number">{fixture.goals.away ?? '-'}</span>
          </div>
          {['NS', 'TBD', 'PST'].includes(fixture.fixture.status.short) && (
            <div className="time-info">
              <div className="countdown">{timeRemaining}</div>
            </div>
          )}
        </div>

        <div className="team away-team">
          {fixture.teams.away.logo && (
            <img src={fixture.teams.away.logo} alt={fixture.teams.away.name} className="team-logo" />
          )}
          <div className="team-name">{fixture.teams.away.name}</div>
        </div>
      </div>

      <button className="watch-btn" onClick={fetchRandomFixture}>
        🔄 Следващ мач
      </button>
      
      {fixture && (
        <button 
          className="watch-btn" 
          onClick={() => {
            localStorage.setItem('selectedFixture', JSON.stringify(fixture))
            navigate(`/game/${fixture.fixture.id}`)
          }}
          style={{ marginTop: '8px', background: '#4caf50' }}
        >
          📊 Виж статистика
        </button>
      )}
    </div>
  )
}

export default FeaturedMatch
