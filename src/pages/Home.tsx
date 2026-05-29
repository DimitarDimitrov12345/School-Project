import React, { useState } from 'react'
import GamesWidget from '../components/GamesWidget'
import '../styles/schedule.css'

const LABELS = {
  today: '\u0414\u041d\u0415\u0421',
  tomorrow: '\u0423\u0422\u0420\u0415',
  yesterday: '\u0412\u0427\u0415\u0420\u0410',
  title: '\u041f\u0440\u043e\u0433\u0440\u0430\u043c\u0430 \u043d\u0430 \u043c\u0430\u0447\u043e\u0432\u0435\u0442\u0435',
} as const

const tabs = [LABELS.today, LABELS.tomorrow, LABELS.yesterday] as const

type Tab = typeof tabs[number]

const Home: React.FC = () => {
  const [active, setActive] = useState<Tab>(LABELS.today)

  const getDisplayDate = (tab: Tab): Date => {
    const today = new Date()

    switch (tab) {
      case LABELS.today:
        return today
      case LABELS.tomorrow: {
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow
      }
      case LABELS.yesterday: {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        return yesterday
      }
    }
  }

  const displayDate = getDisplayDate(active)

  return (
    <main className="schedule-page">
      <header className="header">
        <div>
          <h1>{LABELS.title}</h1>
          <div className="date">
            {active}
            {' \u2022 '}
            {displayDate.toLocaleDateString()}
          </div>
        </div>

        <div className="header-right">
          <div className="tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`tab ${tab === active ? 'active' : ''}`}
                onClick={() => setActive(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="section">
        <GamesWidget tab={active} />
      </section>
    </main>
  )
}

export default Home
