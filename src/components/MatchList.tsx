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

const MatchList: React.FC<Props> = ({ matches }) => {
  const grouped = groupByLeague(matches)

  const leagueEntries = Object.entries(grouped)

  return (
    <div className="match-list">
      {leagueEntries.map(([league, ms]) => (
        <LeagueGroup key={league} league={league} matches={ms} />
      ))}
    </div>
  )
}

export default MatchList
