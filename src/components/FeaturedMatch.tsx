import React, { useEffect, useState } from 'react'
import '../styles/featuredMatch.css'

interface FeaturedMatchProps {
  homeTeam: string
  awayTeam: string
  league: string
  time: string
  homeScore?: number
  awayScore?: number
  status: 'Upcoming' | 'Live' | 'Finished'
}

const FeaturedMatch: React.FC<FeaturedMatchProps> = ({
  homeTeam,
  awayTeam,
  league,
  time,
  homeScore,
  awayScore,
  status,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  useEffect(() => {
    if (status !== 'Upcoming') return

    const updateTimer = () => {
      const now = new Date()
      const [hours, minutes] = time.split(':').map(Number)
      const matchTime = new Date()
      matchTime.setHours(hours, minutes, 0)

      if (matchTime < now) {
        matchTime.setDate(matchTime.getDate() + 1)
      }

      const diff = matchTime.getTime() - now.getTime()
      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeRemaining(`${h}h ${m}m`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000)
    return () => clearInterval(interval)
  }, [status, time])

  return (
    <div className="featured-match">
      <div className="featured-header">
        <h3>Match of the Day</h3>
        <span className={`status-badge status-${status.toLowerCase()}`}>
          {status}
        </span>
      </div>

      <div className="featured-league">{league}</div>

      <div className="featured-content">
        <div className="team home-team">
          <div className="team-emoji">⚽</div>
          <div className="team-name">{homeTeam}</div>
        </div>

        <div className="match-info">
          {status === 'Live' ? (
            <div className="score">
              <span className="score-number">{homeScore}</span>
              <span className="score-separator">-</span>
              <span className="score-number">{awayScore}</span>
            </div>
          ) : status === 'Finished' ? (
            <div className="score">
              <span className="score-number">{homeScore}</span>
              <span className="score-separator">-</span>
              <span className="score-number">{awayScore}</span>
            </div>
          ) : (
            <div className="time-info">
              <div className="match-time">{time}</div>
              <div className="countdown">{timeRemaining}</div>
            </div>
          )}
        </div>

        <div className="team away-team">
          <div className="team-emoji">⚽</div>
          <div className="team-name">{awayTeam}</div>
        </div>
      </div>

      <button className="watch-btn">Watch Stats</button>
    </div>
  )
}

export default FeaturedMatch
