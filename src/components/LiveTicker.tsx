import React, { useEffect, useState } from 'react'
import '../styles/liveTicker.css'

interface TickerEvent {
  id: string
  team: string
  action: 'goal' | 'card' | 'substitution'
  player: string
  minute: number
  match: string
}

interface LiveTickerProps {
  events?: TickerEvent[]
}

const sampleEvents: TickerEvent[] = [
  { id: '1', team: 'Arsenal', action: 'goal', player: 'Bukayo Saka', minute: 45, match: 'Arsenal vs Chelsea' },
  { id: '2', team: 'Manchester United', action: 'card', player: 'Bruno Fernandes', minute: 38, match: 'Man United vs Liverpool' },
  { id: '3', team: 'Real Madrid', action: 'goal', player: 'Kylian Mbappé', minute: 12, match: 'Real Madrid vs Barcelona' },
  { id: '4', team: 'Bayern', action: 'substitution', player: 'Serge Gnabry', minute: 60, match: 'Bayern vs Dortmund' },
  { id: '5', team: 'Liverpool', action: 'goal', player: 'Mohamed Salah', minute: 25, match: 'Man United vs Liverpool' },
]

const LiveTicker: React.FC<LiveTickerProps> = ({ events = sampleEvents }) => {
  const [displayEvents, setDisplayEvents] = useState(events)

  useEffect(() => {
    let currentIndex = 0
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % events.length
      setDisplayEvents(events.slice(currentIndex).concat(events.slice(0, currentIndex)))
    }, 4000)
    return () => clearInterval(interval)
  }, [events])

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'goal':
        return '⚽'
      case 'card':
        return '🟨'
      case 'substitution':
        return '🔄'
      default:
        return '📌'
    }
  }

  return (
    <div className="live-ticker">
      <div className="ticker-header">
        <div className="live-indicator">
          <span className="live-dot"></span>
          <span className="live-text">НА ЖИВО</span>
        </div>
      </div>

      <div className="ticker-scroll">
        {displayEvents.map((event) => (
          <div key={event.id} className="ticker-item">
            <span className="action-icon">{getActionIcon(event.action)}</span>
            <div className="event-details">
              <div className="event-match">{event.match}</div>
              <div className="event-info">
                {event.team} • {event.player} ({event.minute}')
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LiveTicker
