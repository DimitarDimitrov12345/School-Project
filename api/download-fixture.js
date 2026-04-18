import fs from 'fs'
import path from 'path'

const FIXTURES_DIR = path.join(process.cwd(), 'saved-fixtures')

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ error: 'Missing fixture ID' })
    }

    if (!fs.existsSync(FIXTURES_DIR)) {
      fs.mkdirSync(FIXTURES_DIR, { recursive: true })
    }

    const apiKey = process.env.VITE_FOOTBALL_API_KEY || process.env.FOOTBALL_API_KEY

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' })
    }

    const response = await fetch(`https://v3.football.api-sports.io/fixtures?id=${id}`, {
      method: 'GET',
      headers: {
        'x-apisports-key': apiKey,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return res.status(response.status).json({ error: `API error: ${response.statusText}` })
    }

    const data = await response.json()

    if (data.errors && Object.keys(data.errors).length > 0) {
      return res.status(400).json({ error: data.errors[0] })
    }

    if (!data.response || data.response.length === 0) {
      return res.status(404).json({ error: `Fixture ${id} not found` })
    }

    const fixture = data.response[0]

    // Save to individual fixture file
    const filename = `fixture_${id}.json`
    const filepath = path.join(FIXTURES_DIR, filename)
    fs.writeFileSync(filepath, JSON.stringify(fixture, null, 2), 'utf8')

    res.json({
      success: true,
      message: `Downloaded fixture ${id}`,
      filename,
      filepath,
      fixture,
      hasStatistics: !!fixture.statistics
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
