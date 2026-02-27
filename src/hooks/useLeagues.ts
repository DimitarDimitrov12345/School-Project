import { useState, useEffect } from 'react'

export interface League {
  id: string
  name: string
  country: string
  tier?: 'top' | 'other'
}

// Default leagues - replace with API call when ready
const DEFAULT_LEAGUES: League[] = [
  // Top 5 Leagues
  { id: '1', name: 'Premier League', country: 'England', tier: 'top' },
  { id: '2', name: 'La Liga', country: 'Spain', tier: 'top' },
  { id: '3', name: 'Serie A', country: 'Italy', tier: 'top' },
  { id: '4', name: 'Bundesliga', country: 'Germany', tier: 'top' },
  { id: '5', name: 'Ligue 1', country: 'France', tier: 'top' },
  // Other Leagues by Country
  { id: '6', name: 'Championship', country: 'England', tier: 'other' },
  { id: '7', name: 'Eredivisie', country: 'Netherlands', tier: 'other' },
  { id: '8', name: 'Liga MX', country: 'Mexico', tier: 'other' },
  { id: '9', name: 'Primeira Liga', country: 'Portugal', tier: 'other' },
  { id: '10', name: 'Scottish Premiership', country: 'Scotland', tier: 'other' },
  { id: '11', name: 'Serie B', country: 'Italy', tier: 'other' },
]

interface UseLeaguesOptions {
  apiUrl?: string
}

/**
 * Custom hook to fetch leagues from an API
 * @param options - Configuration options
 * @param options.apiUrl - Optional API endpoint to fetch leagues from
 * @returns Object with leagues array, loading state, and error state
 */
export const useLeagues = (options?: UseLeaguesOptions) => {
  const [leagues, setLeagues] = useState<League[]>(DEFAULT_LEAGUES)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const apiUrl = options?.apiUrl
    if (!apiUrl) {
      // Use default leagues if no API URL provided
      setLeagues(DEFAULT_LEAGUES)
      return
    }

    const fetchLeagues = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(apiUrl)
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }
        const data = await response.json()
        
        // Ensure the API response has the correct structure
        // Adjust this based on your API's actual response format
        const leaguesData = Array.isArray(data) ? data : data.leagues || []
        setLeagues(leaguesData)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch leagues')
        setError(error)
        // Fall back to default leagues on error
        setLeagues(DEFAULT_LEAGUES)
      } finally {
        setLoading(false)
      }
    }

    fetchLeagues()
  }, [options?.apiUrl])

  return { leagues, loading, error }
}
