import React from 'react'
import { useLeagues } from '../hooks/useLeagues'
import '../styles/sidebar.css'

interface Props {
  open?: boolean
  onClose?: () => void
}

const Sidebar: React.FC<Props> = ({ open = true, onClose }) => {
  const { leagues } = useLeagues()

  // Separate top 5 leagues
  const topLeagues = leagues.filter(league => league.tier === 'top')
  // Group other leagues by country
  const otherLeagues = leagues.filter(league => league.tier === 'other')
  const leaguesByCountry = otherLeagues.reduce((acc, league) => {
    if (!acc[league.country]) {
      acc[league.country] = []
    }
    acc[league.country].push(league)
    return acc
  }, {} as Record<string, typeof otherLeagues>)
  // Sort countries alphabetically
  const sortedCountries = Object.keys(leaguesByCountry).sort()

  return (
    <aside className={`sidebar ${open ? 'open' : 'closed'}`} aria-label="Sidebar navigation">
      {onClose && open && (
        <button
          type="button"
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ✕
        </button>
      )}
      <div className="sidebar-top-spacer" />

      <div className="leagues-section">
        <div className="leagues-section-title">Топ 5 Лиги</div>
        <ul className="leagues-list">
          {topLeagues.map((league) => (
            <li key={league.id}>
              <a href={`#${league.name}`} className="league-item">
                {league.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="countries-section">
        <div className="leagues-section-title">Държави</div>
        {sortedCountries.map((country) => (
          <div key={country} className="country-group">
            <div className="country-name">{country}</div>
            <ul className="leagues-list">
              {leaguesByCountry[country].map((league) => (
                <li key={league.id}>
                  <a href={`#${league.name}`} className="league-item">
                    {league.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer">v0.1</div>
    </aside>
  )
}

export default Sidebar
