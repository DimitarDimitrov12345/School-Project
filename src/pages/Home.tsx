import React, { useState } from 'react'
import MatchList from '../components/MatchList'
import { matches } from '../data/dummyMatches'
import '../styles/schedule.css'

const tabs = ['TODAY', 'TOMORROW', 'YESTERDAY'] as const

type Tab = typeof tabs[number]

const Home: React.FC = () => {
  const [active, setActive] = useState<Tab>('TODAY')

  // simple tab filtering (dummyDates via isToday for demo)
  const today = matches.filter((m) => m.isToday)
  const upcoming = matches.filter((m) => !m.isToday)

  const getMatchesForTab = (tab: Tab) => {
    switch (tab) {
      case 'TODAY':
        return today
      case 'TOMORROW':
        return upcoming
      case 'YESTERDAY':
        return []
      default:
        return []
    }
  }

  return (
    <main className="schedule-page">
      <header className="header">
        <div>
          <h1>Match Schedule</h1>
          <div className="date">Today • {new Date().toLocaleDateString()}</div>
        </div>
        <div className="header-right">
          <div className="tabs">
            {tabs.map((t) => (
              <button key={t} className={`tab ${t === active ? 'active' : ''}`} onClick={() => setActive(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="section">
        <h2 className="section-title">{active === 'TODAY' ? 'Today' : active === 'TOMORROW' ? 'Tomorrow' : 'Yesterday'}</h2>
        {getMatchesForTab(active).length ? (
          <MatchList matches={getMatchesForTab(active)} />
        ) : (
          <div className="empty">No matches</div>
        )}
      </section>
    </main>
  )
}

export default Home
