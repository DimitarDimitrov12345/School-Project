import fs from 'fs'
import path from 'path'

const FIXTURES_DIR = path.join(process.cwd(), 'saved-fixtures')

const TOP_LEAGUE_IDS = [
  39, 140, 135, 78, 61, 2, 3, 848, 1, 4, 94, 88, 172, 203, 179, 253, 307
]

const PRIORITY_LEAGUES = [39, 140, 61]

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const todayFile = `fixtures_${year}-${month}-${day}.json`
    const todayPath = path.join(FIXTURES_DIR, todayFile)

    if (!fs.existsSync(todayPath)) {
      return res.status(404).json({ success: false, error: 'No fixtures available for today' })
    }

    const todayData = JSON.parse(fs.readFileSync(todayPath, 'utf8'))

    if (!todayData.response || todayData.response.length === 0) {
      return res.status(404).json({ success: false, error: 'No fixtures available for today' })
    }

    let topFixtures = todayData.response.filter(f => TOP_LEAGUE_IDS.includes(f.league.id))
    if (topFixtures.length === 0) {
      topFixtures = todayData.response
    }

    let selectedPool = null
    for (const leagueId of PRIORITY_LEAGUES) {
      const matches = topFixtures.filter(f => f.league.id === leagueId)
      if (matches.length > 0) {
        selectedPool = matches
        break
      }
    }

    if (!selectedPool) {
      selectedPool = topFixtures
    }

    const randomIndex = Math.floor(Math.random() * selectedPool.length)
    const randomFixture = selectedPool[randomIndex]

    res.json({ success: true, fixture: randomFixture })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
