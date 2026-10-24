import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Creates a browser-compatible Supabase client that writes auth tokens to cookies.
 * This ensures SSR server components, API routes, and middleware can read session state.
 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Singleton client instance for client-side queries and subscriptions.
 */
export const supabase =
  typeof window !== 'undefined'
    ? createBrowserClient(supabaseUrl, supabaseAnonKey)
    : createSupabaseClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      })

let _supabaseAdmin: any = null

/**
 * Admin client for privileged backend operations (bypasses RLS).
 */
export function getSupabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseAdmin can only be called on the server side')
  }

  if (!_supabaseAdmin) {
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseServiceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
    }
    _supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return _supabaseAdmin
}