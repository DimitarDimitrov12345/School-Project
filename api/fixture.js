import fs from 'fs'
import path from 'path'

const FIXTURES_DIR = path.join(process.cwd(), 'saved-fixtures')

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ error: 'Missing fixture ID' })
    }

    // Check for individual fixture file
    const individualFilepath = path.join(FIXTURES_DIR, `fixture_${id}.json`)
    if (fs.existsSync(individualFilepath)) {
      try {
        const fixture = JSON.parse(fs.readFileSync(individualFilepath, 'utf8'))
        return res.json({ success: true, fixture, source: 'individual' })
      } catch (e) {
        // Continue
      }
    }

    // Search in date-based fixture files
    const datesToCheck = []
    for (let offset = -2; offset <= 2; offset++) {
      const date = new Date()
      date.setDate(date.getDate() + offset)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      datesToCheck.push(`${year}-${month}-${day}`)
    }

    for (const dateStr of datesToCheck) {
      const filepath = path.join(FIXTURES_DIR, `fixtures_${dateStr}.json`)
      if (fs.existsSync(filepath)) {
        try {
          const data = JSON.parse(fs.readFileSync(filepath, 'utf8'))
          const fixture = data.response?.find(f => f.fixture.id === parseInt(id))
          if (fixture) {
            return res.json({ success: true, fixture, source: 'date-batch' })
          }
        } catch (e) {
          // Continue
        }
      }
    }

    return res.status(404).json({ error: `Fixture ${id} not found` })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
