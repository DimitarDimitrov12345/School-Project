import React from 'react'
import type { Match } from '../types'
import LeagueGroup from './LeagueGroup'

interface Props {
  matches: Match[]
}

const groupByLeague = (matches: Match[]) => {
  const map: Record<string, Match[]> = {}
  matches.forEach((m) => {
    if (!map[m.league]) map[m.league] = []
    map[m.league].push(m)
  })
  return map
}

const TOP_LEAGUES = [
  'UEFA Champions League',
  'UEFA Europa League',
  'UEFA Europa Conference League',
  'Premier League',
  'La Liga',
  'Serie A',
  'Bundesliga',
  'Ligue 1',
]

const MatchList: React.FC<Props> = ({ matches }) => {
  const grouped = groupByLeague(matches)

  const leagueEntries = Object.entries(grouped).sort(([a], [b]) => {
    const aIdx = TOP_LEAGUES.findIndex(l => a.includes(l))
    const bIdx = TOP_LEAGUES.findIndex(l => b.includes(l))
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
    if (aIdx !== -1) return -1
    if (bIdx !== -1) return 1
    return 0
  })

  return (
    <div className="match-list">
      {leagueEntries.map(([league, ms]) => (
        <LeagueGroup key={league} league={league} matches={ms} />
      ))}
    </div>
  )
}

export default MatchList
