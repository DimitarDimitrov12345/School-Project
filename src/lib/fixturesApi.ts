/**
 * Fixtures API utility
 * Fetches football fixtures for specific dates from API-Sports
 */

export interface Fixture {
  fixture: {
    id: number
    date: string
    timestamp: number
    timezone: string
    week: number
  }
  league: {
    id: number
    name: string
    country: string
    logo: string
    flag: string
    season: number
    round: string
  }
  teams: {
    home: {
      id: number
      name: string
      logo: string
    }
    away: {
      id: number
      name: string
      logo: string
    }
  }
  goals: {
    home: number | null
    away: number | null
  }
  score: {
    halftime: {
      home: number | null
      away: number | null
    }
    fulltime: {
      home: number | null
      away: number | null
    }
  }
  status: {
    long: string
    short: string
    elapsed: number | null
  }
}

export interface FixturesResponse {
  get: string
  parameters: Record<string, string>
  errors: string[]
  results: number
  paging: {
    current: number
    total: number
  }
  response: Fixture[]
}

/**
 * Get fixtures for a specific date
 * @param date - Date string in YYYY-MM-DD format
 * @param apiKey - API Sports API key
 * @returns Fixtures data for the date
 */
export async function getFixturesByDate(
  date: string,
  apiKey: string
): Promise<FixturesResponse> {
  const url = `https://v3.football.api-sports.io/fixtures?date=${date}`;

  const options = {
    method: 'GET',
    headers: {
      'x-apisports-key': apiKey,
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data: FixturesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching fixtures:', error);
    throw error;
  }
}

/**
 * Get date in YYYY-MM-DD format
 * @param daysOffset - Number of days to offset from today (0 = today, -1 = yesterday, 1 = tomorrow)
 * @returns Date string
 */
export function formatDate(daysOffset: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

/**
 * Fetch fixtures for today, yesterday, and tomorrow
 * @param apiKey - API Sports API key
 * @returns Object with fixtures for each date
 */
export async function getFixturesForDateRange(apiKey: string) {
  const yesterday = formatDate(-1);
  const today = formatDate(0);
  const tomorrow = formatDate(1);

  try {
    const [yesterdayData, todayData, tomorrowData] = await Promise.all([
      getFixturesByDate(yesterday, apiKey),
      getFixturesByDate(today, apiKey),
      getFixturesByDate(tomorrow, apiKey),
    ]);

    return {
      yesterday: {
        date: yesterday,
        data: yesterdayData,
      },
      today: {
        date: today,
        data: todayData,
      },
      tomorrow: {
        date: tomorrow,
        data: tomorrowData,
      },
    };
  } catch (error) {
    console.error('Error fetching fixtures for date range:', error);
    throw error;
  }
}
