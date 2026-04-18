import React from 'react'
import { useLeagues } from '../hooks/useLeagues'
import '../styles/mobileLeagues.css'

const MobileLeagues: React.FC = () => {
  const { leagues } = useLeagues()

  const topLeagues = leagues.filter(league => league.tier === 'top')
  const otherLeagues = leagues.filter(league => league.tier === 'other')
  const leaguesByCountry = otherLeagues.reduce((acc, league) => {
    if (!acc[league.country]) {
      acc[league.country] = []
    }
    acc[league.country].push(league)
    return acc
  }, {} as Record<string, typeof otherLeagues>)
  const sortedCountries = Object.keys(leaguesByCountry).sort()

  return (
    <div className="mobile-leagues">
      <div className="mobile-leagues-section">
        <h3 className="mobile-leagues-title">⚽ Топ 5 Лиги</h3>
        <div className="mobile-leagues-list">
          {topLeagues.map((league) => (
            <a key={league.id} href={`#${league.name}`} className="mobile-league-item">
              {league.name}
            </a>
          ))}
        </div>
      </div>

      <div className="mobile-leagues-section">
        <h3 className="mobile-leagues-title">🌍 Държави</h3>
        {sortedCountries.map((country) => (
          <div key={country} className="mobile-country-group">
            <div className="mobile-country-name">{country}</div>
            <div className="mobile-leagues-list">
              {leaguesByCountry[country].map((league) => (
                <a key={league.id} href={`#${league.name}`} className="mobile-league-item">
                  {league.name}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MobileLeagues
