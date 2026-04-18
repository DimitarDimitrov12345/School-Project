import { deleteAllFixtures } from './_supabase.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const count = await deleteAllFixtures()

    res.json({
      success: true,
      message: `Deleted ${count} fixture files`,
      count
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
