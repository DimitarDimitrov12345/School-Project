import fs from 'fs'
import path from 'path'

const FIXTURES_DIR = path.join(process.cwd(), 'saved-fixtures')

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    if (!fs.existsSync(FIXTURES_DIR)) {
      return res.json({ success: true, message: 'No fixtures directory', count: 0 })
    }

    const files = fs.readdirSync(FIXTURES_DIR).filter(f => f.endsWith('.json'))

    let deletedCount = 0
    for (const file of files) {
      const filepath = path.join(FIXTURES_DIR, file)
      fs.unlinkSync(filepath)
      deletedCount++
    }

    res.json({
      success: true,
      message: `Deleted ${deletedCount} fixture files`,
      count: deletedCount
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
