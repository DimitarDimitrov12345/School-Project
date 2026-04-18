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
    const { date, data } = req.body

    if (!date || !data) {
      return res.status(400).json({ error: 'Missing date or data' })
    }

    const filename = `fixtures_${date}.json`
    const filepath = path.join(FIXTURES_DIR, filename)

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8')

    res.json({
      success: true,
      message: `Saved ${filename}`,
      filepath,
      filename,
      date
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
