import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase'

export async function createSupabaseServerClient() {
  let cookieStore: any = null
  try {
    cookieStore = await cookies()
  } catch {
    // Handling cases when called in a static or restricted context
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore?.get ? cookieStore.get(name)?.value : undefined
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore?.set?.({ name, value, ...options })
        } catch {
          // Can be called from Server Component where cookies are read-only
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore?.set?.({ name, value: '', ...options })
        } catch {
          // Can be called from Server Component where cookies are read-only
        }
      },
    },
  })
}