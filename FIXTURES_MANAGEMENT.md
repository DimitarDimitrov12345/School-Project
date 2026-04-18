# Fixtures Management System

This document explains how to use the **Fixtures Management** feature for your project.

## 📋 Overview

The Fixtures Manager allows you to download and view football fixtures for today, yesterday, and tomorrow from the API-Sports API. Data can be downloaded as JSON files and cached locally.

## 🔧 Setup

### 1. Get an API Key

1. Go to https://www.api-football.com/
2. Sign up for a free or paid plan
3. Copy your API key

### 2. Add API Key to .env

Open `.env` file in the project root and update:

```
VITE_FOOTBALL_API_KEY=your_actual_api_key_here
```

### 3. Restart Development Server

```bash
npm run dev
```

## 📂 File Structure

The Fixtures Management feature includes:

```
src/
├── lib/
│   └── fixturesApi.ts          # API functions and types
├── components/
│   └── FixturesManager.tsx      # UI component (standalone)
└── styles/
    └── fixturesManager.css      # Styling
```

## 🔌 API Functions

Located in [src/lib/fixturesApi.ts](src/lib/fixturesApi.ts)

### `getFixturesByDate(date, apiKey)`
Fetches fixtures for a specific date.

```typescript
import { getFixturesByDate } from '@/lib/fixturesApi'

const data = await getFixturesByDate('2024-03-28', 'YOUR_API_KEY')
```

### `getFixturesForDateRange(apiKey)`
Fetches fixtures for today, yesterday, and tomorrow in parallel.

```typescript
import { getFixturesForDateRange } from '@/lib/fixturesApi'

const allFixtures = await getFixturesForDateRange('YOUR_API_KEY')
// Returns object with { yesterday, today, tomorrow }
```

### `formatDate(daysOffset)`
Helper to format dates. Offset 0 = today, -1 = yesterday, 1 = tomorrow.

```typescript
import { formatDate } from '@/lib/fixturesApi'

formatDate(0)  // Today
formatDate(-1) // Yesterday
formatDate(1)  // Tomorrow
```

## 📱 Using the FixturesManager Component

### Basic Usage

Import and use the component anywhere in your app:

```typescript
import FixturesManager from '@/components/FixturesManager'

export default function MyPage() {
  return (
    <div>
      <FixturesManager />
    </div>
  )
}
```

### Features

- **Download Button** - Fetches fixtures for today, yesterday, and tomorrow
- **Date Tabs** - Switch between Yesterday, Today, Tomorrow
- **Match Preview** - View up to 10 matches per date with teams and times
- **Export JSON** - Download fixtures as JSON file
- **Load from Storage** - Retrieve previously downloaded fixtures from browser cache
- **Browser Cache** - Automatically saves to localStorage for persistence

## 💾 Data Storage

- **Browser localStorage**: Cached in `football_fixtures` key
- **JSON files**: Can be downloaded for backup/integration
- **No server storage**: Data not persisted to database by default

## 🚀 Integration Examples

### Add to Admin Dashboard

```typescript
import FixturesManager from '@/components/FixturesManager'

export default function AdminDashboard() {
  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      <FixturesManager />
      {/* other admin components */}
    </div>
  )
}
```

### Add to Home Page

```typescript
import FixturesManager from '@/components/FixturesManager'

export default function Home() {
  return (
    <div>
      <FixturesManager />
    </div>
  )
}
```

### Save to Supabase

After fetching, save to Supabase database:

```typescript
import { supabase } from '@/lib/supabase'
import { getFixturesForDateRange } from '@/lib/fixturesApi'

const apiKey = import.meta.env.VITE_FOOTBALL_API_KEY
const fixtures = await getFixturesForDateRange(apiKey)

const { error } = await supabase
  .from('fixtures')
  .insert([
    { date: fixtures.today.date, data: fixtures.today.data },
    { date: fixtures.yesterday.date, data: fixtures.yesterday.data },
    { date: fixtures.tomorrow.date, data: fixtures.tomorrow.data }
  ])
```

## ⚠️ API Limits

- **Free tier**: 10 requests/min (API-Sports)
- **Pro tier**: 30-100 requests/min
- Check your plan at https://www.api-football.com/

## 🐛 Troubleshooting

### "API key not configured"
- Check `.env` file has `VITE_FOOTBALL_API_KEY` set
- Restart dev server with `npm run dev`

### "Failed to download fixtures"
- Verify API key is correct
- Check API rate limits
- Open browser console for detailed errors

### No fixtures showing
- Some dates may have no scheduled matches
- Try different dates
- Verify your API key has access to the leagues

## 📝 Next Steps

- [ ] Add automatic daily refresh
- [ ] Store fixtures in Supabase database
- [ ] Create fixture search/filter interface
- [ ] Add predictions/betting odds
- [ ] Implement notifications for upcoming matches
