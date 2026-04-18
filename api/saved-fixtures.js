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
    const { date } = req.query

    if (!date) {
      return res.status(400).json({ error: 'Missing date parameter' })
    }

    const filename = `fixtures_${date}.json`
    const data = await downloadFixture(filename)

    if (!data) {
      return res.status(404).json({ error: `No fixtures found for ${date}` })
    }

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
