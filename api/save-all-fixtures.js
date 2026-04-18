import { uploadFixture } from './_supabase.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

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

    for (const { data } of dates) {
      const filename = `fixtures_${data.date}.json`
      await uploadFixture(filename, data)
      results.push({ filename, date: data.date })
    }

    res.json({
      success: true,
      message: 'Saved 3 fixture files',
      files: results
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
