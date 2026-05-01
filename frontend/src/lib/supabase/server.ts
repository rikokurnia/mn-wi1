import { createClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase admin client (uses SERVICE_ROLE key, bypasses RLS).
 * Only import this in API routes (never in client components).
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set in environment variables')
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables')

  return createClient(url, serviceKey, {
    auth: { persistSession: false }
  })
}
