import fs from 'fs'
import path from 'path'

const FIXTURES_DIR = path.join(process.cwd(), 'saved-fixtures')

if (!fs.existsSync(FIXTURES_DIR)) {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true })
}

export default function handler(req, res) {
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
      const filepath = path.join(FIXTURES_DIR, filename)
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8')
      results.push({ filename, date: data.date, filepath })
    }

    res.json({
      success: true,
      message: 'Saved 3 fixture files',
      files: results,
      directory: FIXTURES_DIR
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
