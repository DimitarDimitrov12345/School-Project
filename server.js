import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json({ limit: '50mb' }))

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// Save fixtures to saved-fixtures folder
const FIXTURES_DIR = path.join(__dirname, 'saved-fixtures')

// Create directory if it doesn't exist
if (!fs.existsSync(FIXTURES_DIR)) {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true })
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Save fixtures endpoint
app.post('/api/save-fixtures', (req, res) => {
  try {
    const { date, data } = req.body
    
    console.log(`\n📥 REQUEST: POST /api/save-fixtures`)
    console.log(`   Date: ${date}`)
    console.log(`   Data size: ${JSON.stringify(data).length} bytes`)

    if (!date || !data) {
      console.error('   ❌ Missing date or data')
      return res.status(400).json({ error: 'Missing date or data' })
    }

    const filename = `fixtures_${date}.json`
    const filepath = path.join(FIXTURES_DIR, filename)

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8')
    
    console.log(`   ✅ Saved: ${filepath}`)

    res.json({
      success: true,
      message: `Saved ${filename}`,
      filepath: filepath,
      filename: filename,
      date: date
    })
  } catch (error) {
    console.error('   ❌ ERROR:', error)
    res.status(500).json({ error: error.message })
  }
})

// Save all three dates
app.post('/api/save-all-fixtures', (req, res) => {
  try {
    const { yesterday, today, tomorrow } = req.body

    if (!yesterday || !today || !tomorrow) {
      return res.status(400).json({ error: 'Missing fixture data' })
    }

    const results = []

    const dates = [
      { data: yesterday, key: 'yesterday' },
      { data: today, key: 'today' },
      { data: tomorrow, key: 'tomorrow' }
    ]

    for (const { data, key } of dates) {
      const filename = `fixtures_${data.date}.json`
      const filepath = path.join(FIXTURES_DIR, filename)
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8')
      results.push({
        filename: filename,
        date: data.date,
        filepath: filepath
      })
    }

    res.json({
      success: true,
      message: `Saved 3 fixture files`,
      files: results,
      directory: FIXTURES_DIR
    })
  } catch (error) {
    console.error('Error saving fixtures:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get saved fixtures - if ?date= param, return fixture data; otherwise list files
app.get('/api/saved-fixtures', (req, res) => {
  try {
    const { date } = req.query

    // If date param provided, serve that fixture file
    if (date) {
      const filepath = path.join(FIXTURES_DIR, `fixtures_${date}.json`)
      if (fs.existsSync(filepath)) {
        const data = JSON.parse(fs.readFileSync(filepath, 'utf8'))
        return res.json(data)
      }
      return res.status(404).json({ error: `No fixtures found for ${date}` })
    }

    // Otherwise list all files
    const files = fs.readdirSync(FIXTURES_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const filepath = path.join(FIXTURES_DIR, f)
        const stat = fs.statSync(filepath)
        return {
          filename: f,
          size: stat.size,
          modified: stat.mtime
        }
      })

    res.json({
      success: true,
      directory: FIXTURES_DIR,
      files: files,
      count: files.length
    })
  } catch (error) {
    console.error('Error reading fixtures:', error)
    res.status(500).json({ error: error.message })
  }
})

// Delete all fixtures
app.post('/api/delete-all-fixtures', (req, res) => {
  try {
    console.log(`\n📥 REQUEST: POST /api/delete-all-fixtures`)
    const files = fs.readdirSync(FIXTURES_DIR)
      .filter(f => f.endsWith('.json'))

    let deletedCount = 0
    for (const file of files) {
      const filepath = path.join(FIXTURES_DIR, file)
      fs.unlinkSync(filepath)
      console.log(`   🗑️ Deleted: ${file}`)
      deletedCount++
    }

    console.log(`   ✅ Deleted ${deletedCount} files`)

    res.json({
      success: true,
      message: `Deleted ${deletedCount} fixture files`,
      count: deletedCount
    })
  } catch (error) {
    console.error('   ❌ ERROR:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get fixture by ID from saved files or API
app.get('/api/fixture/:id?', async (req, res) => {
  try {
    const id = req.params.id || req.query.id
    console.log(`\n📥 REQUEST: GET /api/fixture/${id}`)
    
    // First check for individual fixture file
    const individualFilepath = path.join(FIXTURES_DIR, `fixture_${id}.json`)
    if (fs.existsSync(individualFilepath)) {
      try {
        const fixture = JSON.parse(fs.readFileSync(individualFilepath, 'utf8'))
        console.log(`   ✅ Found fixture ${id} in fixture_${id}.json`)
        return res.json({
          success: true,
          fixture: fixture,
          source: 'individual'
        })
      } catch (e) {
        console.error(`   ⚠️ Error reading fixture_${id}.json`)
      }
    }
    
    // Try to find in saved-fixtures first - search multiple dates
    const datesToCheck = []
    
    // Add today and surrounding dates
    for (let offset = -2; offset <= 2; offset++) {
      const date = new Date()
      date.setDate(date.getDate() + offset)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      datesToCheck.push(`${year}-${month}-${day}`)
    }
    
    // Also add hardcoded dates
    datesToCheck.push('2026-03-28', '2026-03-29', '2026-03-30')
    
    for (const dateStr of datesToCheck) {
      const filepath = path.join(FIXTURES_DIR, `fixtures_${dateStr}.json`)
      if (fs.existsSync(filepath)) {
        try {
          const data = JSON.parse(fs.readFileSync(filepath, 'utf8'))
          const fixture = data.response?.find(f => f.fixture.id === parseInt(id))
          if (fixture) {
            console.log(`   ✅ Found fixture ${id} in fixtures_${dateStr}.json`)
            return res.json({
              success: true,
              fixture: fixture,
              source: 'date-batch'
            })
          }
        } catch (e) {
          // Continue to next date
        }
      }
    }
    
    console.log(`   ⚠️ Fixture ${id} not found in saved files`)
    return res.status(404).json({ error: `Fixture ${id} not found` })
  } catch (error) {
    console.error('   ❌ ERROR:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get random fixture from today (top leagues only)
app.get('/api/fixture-random', async (req, res) => {
  try {
    console.log(`\n📥 REQUEST: GET /api/fixture-random`)
    
    // Top league IDs: Premier League, La Liga, Serie A, Bundesliga, Ligue 1,
    // Champions League, Europa League, World Cup, Euro, Primeira Liga, Eredivisie,
    // Liga Pro (Bulgaria), Super Lig (Turkey), Scottish Premiership
    const TOP_LEAGUE_IDS = [
      39,   // Premier League (England)
      140,  // La Liga (Spain)
      135,  // Serie A (Italy)
      78,   // Bundesliga (Germany)
      61,   // Ligue 1 (France)
      2,    // Champions League
      3,    // Europa League
      848,  // Conference League
      1,    // World Cup
      4,    // Euro Championship
      94,   // Primeira Liga (Portugal)
      88,   // Eredivisie (Netherlands)
      172,  // First Professional League (Bulgaria)
      203,  // Super Lig (Turkey)
      179,  // Scottish Premiership
      253,  // MLS (USA)
      307,  // Saudi Pro League
    ]
    
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const todayFile = `fixtures_${year}-${month}-${day}.json`
    const todayPath = path.join(FIXTURES_DIR, todayFile)
    
    if (!fs.existsSync(todayPath)) {
      console.log(`   ⚠️ Today fixtures file not found: ${todayFile}`)
      return res.status(404).json({ success: false, error: 'No fixtures available for today' })
    }
    
    const todayData = JSON.parse(fs.readFileSync(todayPath, 'utf8'))
    
    if (!todayData.response || todayData.response.length === 0) {
      console.log(`   ⚠️ No fixtures in today's data`)
      return res.status(404).json({ success: false, error: 'No fixtures available for today' })
    }
    
    // Filter to top leagues only
    let topFixtures = todayData.response.filter(f => TOP_LEAGUE_IDS.includes(f.league.id))
    
    // Fallback: if no top league matches today, use all fixtures
    if (topFixtures.length === 0) {
      console.log(`   ⚠️ No top league fixtures today, using all fixtures`)
      topFixtures = todayData.response
    }
    
    // Priority order: England first, then Spain, then France, then rest
    const PRIORITY_LEAGUES = [
      39,   // Premier League (England)
      140,  // La Liga (Spain)
      61,   // Ligue 1 (France)
    ]
    
    // Try each priority league in order, pick random from first one that has matches
    let selectedPool = null
    for (const leagueId of PRIORITY_LEAGUES) {
      const matches = topFixtures.filter(f => f.league.id === leagueId)
      if (matches.length > 0) {
        selectedPool = matches
        break
      }
    }
    
    // If none of the priority leagues have matches, use all top fixtures
    if (!selectedPool) {
      selectedPool = topFixtures
    }
    
    const randomIndex = Math.floor(Math.random() * selectedPool.length)
    const randomFixture = selectedPool[randomIndex]
    
    console.log(`   ✅ Selected random fixture ${randomFixture.fixture.id} (${randomFixture.league.name})`)
    res.json({
      success: true,
      fixture: randomFixture
    })
  } catch (error) {
    console.error('   ❌ ERROR:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Download and save a specific fixture by ID from API
app.post('/api/download-fixture/:id?', async (req, res) => {
  try {
    const id = req.params.id || req.query.id
    console.log(`\n📥 REQUEST: POST /api/download-fixture/${id}`)
    
    const apiKey = process.env.VITE_FOOTBALL_API_KEY || 'a88a07b7f2212e54b2cea37bcb8bcac6'
    
    if (!apiKey || apiKey === 'your_api_sports_key') {
      console.log('   ⚠️ Using default API key')
    }

    const options = {
      method: 'GET',
      headers: {
        'x-apisports-key': apiKey,
        'Content-Type': 'application/json'
      }
    };

    console.log(`   🌐 Fetching fixture ${id} from API (with statistics)...`)
    // Request fixture with stats included
    const response = await fetch(`https://v3.football.api-sports.io/fixtures?id=${id}`, options)
    
    if (!response.ok) {
      console.error(`   ❌ API error: ${response.statusText}`)
      return res.status(response.status).json({ error: `API error: ${response.statusText}` })
    }

    const data = await response.json()

    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error(`   ❌ API error:`, data.errors)
      return res.status(400).json({ error: data.errors[0] })
    }

    if (!data.response || data.response.length === 0) {
      console.log(`   ⚠️ Fixture ${id} not found in API`)
      return res.status(404).json({ error: `Fixture ${id} not found` })
    }

    const fixture = data.response[0]
    
    // Save to individual fixture file
    const filename = `fixture_${id}.json`
    const filepath = path.join(FIXTURES_DIR, filename)
    
    fs.writeFileSync(filepath, JSON.stringify(fixture, null, 2), 'utf8')
    
    console.log(`   ✅ Downloaded fixture ${id}`)
    console.log(`   📊 Has statistics: ${fixture.statistics ? 'Yes' : 'No'}`)
    console.log(`   📄 Saved: ${filepath}`)

    res.json({
      success: true,
      message: `Downloaded fixture ${id}`,
      filename: filename,
      filepath: filepath,
      fixture: fixture,
      hasStatistics: !!fixture.statistics
    })
  } catch (error) {
    console.error('   ❌ ERROR:', error.message)
    res.status(500).json({ error: error.message })
  }
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log('')
  console.log('🚀 FIXTURES SERVER STARTED')
  console.log(`📍 URL: http://localhost:${PORT}`)
  console.log(`📁 Saves to: ${FIXTURES_DIR}`)
  console.log('✅ Ready for requests')
  console.log('')
})
