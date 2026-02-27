import React from 'react'
import '../styles/statusBadge.css'

interface Props {
  status: 'Upcoming' | 'Live' | 'Finished'
}

const StatusBadge: React.FC<Props> = ({ status }) => {
  return <span className={`status ${status.toLowerCase()}`}>{status}</span>
}

export default StatusBadge
