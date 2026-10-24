'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export interface AuthUser {
  id: string
  email: string
  role: 'owner' | 'investor'
}

/**
 * Custom hook for authentication state management
 * Provides current user, loading state, and role information
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    const load = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (mounted) {
          if (data?.user && !error) {
            setUser({
              id: data.user.id,
              email: data.user.email || '',
              role: (data.user.user_metadata?.role as 'owner' | 'investor') || 'investor',
            })
          } else {
            setUser(null)
          }
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }
    load()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: (session.user.user_metadata?.role as 'owner' | 'investor') || 'investor',
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      sub?.subscription?.unsubscribe()
    }
  }, [])

  return { user, loading }
}