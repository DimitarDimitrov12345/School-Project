import React from 'react'
import type { Match } from '../types'
import StatusBadge from './StatusBadge'

interface Props {
  match: Match
}

const codeOrName = (teamName?: string, code?: string) => code || (teamName || '').slice(0, 3).toUpperCase()

const MatchRow: React.FC<Props> = ({ match }) => {
  return (
    <div className="match-row">
      <div className="time">{match.time}</div>

      <div className="teams">
        <div className="team home">
          <div className="logo">{match.home.emoji || '🔵'}</div>
          <div className="team-meta">
            <div className="team-code">{codeOrName(match.home.name, match.home.code)}</div>
            <div className="team-name">{match.home.name}</div>
          </div>
        </div>

        <div className="team-away">
          <div className="team-meta away">
            <div className="team-code">{codeOrName(match.away.name, match.away.code)}</div>
            <div className="team-name">{match.away.name}</div>
          </div>
          <div className="logo">{match.away.emoji || '🔴'}</div>
        </div>
      </div>

      <div className="meta">
        <StatusBadge status={match.status} />
        {match.odds && <div className="odds">{match.odds}</div>}
      </div>
    </div>
  )
}

export default MatchRow
