# Setup Instructions

## Option 1: Run Both Dev Server & Fixtures Server (Recommended)

### Terminal 1 - Start Vite dev server:
```bash
npm run dev
```

### Terminal 2 - Start Fixtures server:
```bash
npm run server
```

Then visit: `http://localhost:5173/download-fixtures`

**Result:** Files will be saved to `saved-fixtures/` folder when you download

---

## Option 2: Download Only (No Server)

Just run:
```bash
npm run dev
```

Visit: `http://localhost:5173/download-fixtures`

Files will be saved to **browser localStorage only** (not to the project folder)

A message will suggest running the server if you want to save to the project folder.

---

## Folder Layout

```
project/
├── saved-fixtures/          ← JSON files saved here
│   ├── fixtures_2026-03-27.json
│   ├── fixtures_2026-03-28.json
│   └── fixtures_2026-03-29.json
├── public/
│   └── fixtures/            ← Alternative public folder
├── server.js                ← Backend server for saving files
└── package.json
```

---

## API Endpoints

The server provides these endpoints:

- **POST** `/api/save-all-fixtures` - Save 3 dates of fixtures
- **GET** `/api/saved-fixtures` - List all saved fixture files
- **POST** `/api/save-fixtures` - Save a single date fixture

---

## How It Works

1. Download Fixtures button fetches data from API-Sports API
2. Data is automatically saved to browser localStorage
3. If server is running (port 3001), data is ALSO saved to `saved-fixtures/` folder
4. You'll see ✅ confirmation with file paths and timestamps
