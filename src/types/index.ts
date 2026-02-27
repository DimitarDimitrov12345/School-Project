export type MatchStatus = 'Upcoming' | 'Live' | 'Finished';

export interface Team {
  name: string;
  code?: string; // 3-letter code like ARS
  emoji?: string; // emoji placeholder for logo
  logo?: string; // placeholder URL if needed
}

export interface Match {
  id: string;
  league: string;
  time: string; // e.g. "14:00"
  status: MatchStatus;
  home: Team;
  away: Team;
  isToday?: boolean;
  odds?: string;
}
