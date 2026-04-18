import type { Match } from '../types'

export const matches: Match[] = [
  {
    id: '1',
    home: { name: 'Manchester United' },
    away: { name: 'Liverpool' },
    time: '15:00',
    league: 'Premier League',
    status: 'Live'
  },
  {
    id: '2',
    home: { name: 'Arsenal' },
    away: { name: 'Chelsea' },
    time: '17:30',
    league: 'Premier League',
    status: 'Upcoming'
  },
  {
    id: '3',
    home: { name: 'Real Madrid' },
    away: { name: 'Barcelona' },
    time: '20:45',
    league: 'La Liga',
    status: 'Live'
  }
]

