import { uploadFixture } from './_supabase.js'

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

    const apiKey = process.env.VITE_FOOTBALL_API_KEY || process.env.FOOTBALL_API_KEY

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' })
    }

    const response = await fetch(`https://v3.football.api-sports.io/fixtures?id=${encodeURIComponent(id)}`, {
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

    // Save to Supabase Storage
    const filename = `fixture_${id}.json`
    await uploadFixture(filename, fixture)

    res.json({
      success: true,
      message: `Downloaded fixture ${id}`,
      filename,
      fixture,
      hasStatistics: !!fixture.statistics
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
