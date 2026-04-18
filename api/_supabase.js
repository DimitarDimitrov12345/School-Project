import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase not configured — set SUPABASE_URL + SUPABASE_ANON_KEY env vars')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder'
)

const TABLE = 'fixtures_cache'

/**
 * Save a fixture JSON to the database
 */
export async function uploadFixture(filename, data) {
  const { error } = await supabase
    .from(TABLE)
    .upsert({ filename, data, updated_at: new Date().toISOString() }, { onConflict: 'filename' })
  if (error) throw new Error(`Save failed: ${error.message}`)
  return filename
}

/**
 * Load a fixture JSON from the database
 */
export async function downloadFixture(filename) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('data')
    .eq('filename', filename)
    .single()
  if (error || !data) return null
  return data.data
}

/**
 * List all fixture files in the database
 */
export async function listFixtures() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('filename, updated_at')
  if (error) throw new Error(`List failed: ${error.message}`)
  return data || []
}

/**
 * Delete all fixture entries from the database
 */
export async function deleteAllFixtures() {
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .neq('filename', '')
    .select('filename')
  if (error) throw new Error(`Delete failed: ${error.message}`)
  return data?.length || 0
}
