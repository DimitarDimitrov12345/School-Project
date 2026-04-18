import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase not configured — set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY env vars')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder'
)

const BUCKET = 'fixtures'

/**
 * Upload a JSON file to Supabase Storage
 */
export async function uploadFixture(filename, data) {
  const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, content, {
      contentType: 'application/json',
      upsert: true
    })
  if (error) throw new Error(`Upload failed: ${error.message}`)
  return filename
}

/**
 * Download a JSON file from Supabase Storage
 */
export async function downloadFixture(filename) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(filename)
  if (error) return null
  const text = await data.text()
  return JSON.parse(text)
}

/**
 * List all fixture files in the bucket
 */
export async function listFixtures() {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list('', { limit: 200 })
  if (error) throw new Error(`List failed: ${error.message}`)
  return (data || []).filter(f => f.name.endsWith('.json'))
}

/**
 * Delete all fixture files from the bucket
 */
export async function deleteAllFixtures() {
  const files = await listFixtures()
  if (files.length === 0) return 0
  const paths = files.map(f => f.name)
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove(paths)
  if (error) throw new Error(`Delete failed: ${error.message}`)
  return paths.length
}
