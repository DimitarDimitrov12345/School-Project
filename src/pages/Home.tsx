import React, { useState } from 'react'
import GamesWidget from '../components/GamesWidget'
import '../styles/schedule.css'

const tabs = ['ДНЕС', 'УТРЕ', 'ВЧЕРА'] as const

type Tab = typeof tabs[number]

const Home: React.FC = () => {
  const [active, setActive] = useState<Tab>('ДНЕС');

  // Calculate the date based on the active tab
  const getDisplayDate = (tab: Tab): Date => {
    const today = new Date()
    switch (tab) {
      case 'ДНЕС':
        return today
      case 'УТРЕ':
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow
      case 'ВЧЕРА':
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        return yesterday
    }
  }

  const displayDate = getDisplayDate(active)

  return (
    <main className="schedule-page">
      <header className="header">
        <div>
          <h1>Програма на мачовете</h1>
          <div className="date">{active} • {displayDate.toLocaleDateString()}</div>
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
        <GamesWidget tab={active} />
      </section>
    </main>
  );
};

export default Home
