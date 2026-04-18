import React from 'react'
import '../styles/statusBadge.css'

interface Props {
  status: 'Upcoming' | 'Live' | 'Finished'
}

const StatusBadge: React.FC<Props> = ({ status }) => {
  const labels: Record<string, string> = { Upcoming: 'Предстоящ', Live: 'На живо', Finished: 'Завършен' }
  return <span className={`status ${status.toLowerCase()}`}>{labels[status] || status}</span>
}

export default StatusBadge
