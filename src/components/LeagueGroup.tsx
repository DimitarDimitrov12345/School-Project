import React from 'react'
import type { Match } from '../types'
import MatchRow from './MatchRow'

interface Props {
  league: string
  matches: Match[]
}

const LeagueGroup: React.FC<Props> = ({ league, matches }) => {
  return (
    <div className="league-group">
      <div className="league-header">
        <span className="league-name">{league}</span>
        <span className="league-count">{matches.length}</span>
      </div>
      <div className="matches">
        {matches.map((m) => (
          <MatchRow key={m.id} match={m} />
        ))}
      </div>
    </div>
  )
}

export default LeagueGroup
