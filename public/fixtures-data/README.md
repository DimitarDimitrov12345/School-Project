# Fixtures Data Folder

This folder stores JSON fixture files organized by date.

## File Structure

JSON files should be named in the format: `fixtures_YYYY-MM-DD.json`

Examples:
- `fixtures_2026-03-27.json` - Today's fixtures
- `fixtures_2026-03-28.json` - Tomorrow's fixtures  
- `fixtures_2026-03-26.json` - Yesterday's fixtures

## How to Populate

1. **From React Admin Dashboard:**
   - Visit `http://localhost:5173/download-fixtures`
   - Click "DOWNLOAD FIXTURES NOW" button
   - JSON files will be saved here automatically

2. **Manual Setup:**
   - Run: `npm run dev` (frontend on 5173)
   - In a separate terminal: `npm run server` (backend on 3001)
   - Visit the download page and download fixtures
   - Files will appear in this folder

3. **Using the Games Widget:**
   - The `games.js` file in `/test-widgets/games/` automatically loads fixtures from this folder
   - It expects files named `fixtures_YYYY-MM-DD.json`
   - Date parameter passed to `football_games()` determines which file to load

## Widget Integration

The `games.js` file has been updated to load fixtures from this folder:

```javascript
let dateParam = e || getFormattedDate(0); // e is the date parameter
let apiurl = `/fixtures-data/fixtures_${dateParam}.json`;
await fetch(apiurl);
```

- If no date is provided, it loads today's fixtures
- For yesterday's fixtures: pass date in YYYY-MM-DD format
- For tomorrow's fixtures: pass date in YYYY-MM-DD format

## Expected JSON Format

Each file should contain API-Sports fixtures response:

```json
{
  "get": "fixtures",
  "parameters": {
    "date": "2026-03-27"
  },
  "errors": [],
  "results": 45,
  "paging": {
    "current": 1,
    "total": 1
  },
  "response": [
    {
      "fixture": { "id": 123, "date": "2026-03-27T15:00:00+00:00", ... },
      "league": { "id": 39, "name": "Premier League", ... },
      "teams": { "home": { ... }, "away": { ... } },
      "goals": { "home": 2, "away": 1 },
      "score": { ... }
    },
    ...
  ]
}
```

## Next Steps

1. Download fixtures via React admin dashboard
2. JSON files will appear in this folder
3. Games widget will automatically load them
