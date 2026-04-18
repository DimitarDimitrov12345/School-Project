import { downloadFixture } from './_supabase.js'

export default async function handler(req, res) {
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
    const individual = await downloadFixture(`fixture_${id}.json`)
    if (individual) {
      return res.json({ success: true, fixture: individual, source: 'individual' })
    }

    // Search in date-based fixture files
    for (let offset = -2; offset <= 2; offset++) {
      const date = new Date()
      date.setDate(date.getDate() + offset)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`

      const data = await downloadFixture(`fixtures_${dateStr}.json`)
      if (data) {
        const fixture = data.response?.find(f => f.fixture.id === parseInt(id))
        if (fixture) {
          return res.json({ success: true, fixture, source: 'date-batch' })
        }
      }
    }

    return res.status(404).json({ error: `Fixture ${id} not found` })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
