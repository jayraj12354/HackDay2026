'use client'

import { useEffect, useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase'

export interface AuthUser {
  id: string
  email: string
  role: 'owner' | 'investor'
}

/**
 * Custom hook for authentication state management
 * Seamlessly integrates Supabase Auth and Instant Demo Switching
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const checkDemoUser = (): AuthUser | null => {
      if (typeof window === 'undefined') return null
      try {
        const saved = localStorage.getItem('cafestake_demo_user')
        if (saved) return JSON.parse(saved)
      } catch {}
      return null
    }

    const load = async () => {
      // 1. Try Supabase Auth if configured
      if (isSupabaseConfigured) {
        try {
          const supabase = createClient()
          const { data, error } = await supabase.auth.getUser()
          if (mounted && data?.user && !error) {
            setUser({
              id: data.user.id,
              email: data.user.email || '',
              role: (data.user.user_metadata?.role as 'owner' | 'investor') || 'investor',
            })
            setLoading(false)
            return
          }
        } catch (err) {
          console.warn('Supabase auth check failed:', err)
        }
      }

      // 2. Fallback to Demo Local Session
      const demoUser = checkDemoUser()
      if (mounted) {
        setUser(demoUser)
        setLoading(false)
      }
    }

    load()

    // Subscribe to Supabase auth events if configured
    let subscription: any = null
    if (isSupabaseConfigured) {
      try {
        const supabase = createClient()
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
          if (mounted) {
            if (session?.user) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                role: (session.user.user_metadata?.role as 'owner' | 'investor') || 'investor',
              })
            } else {
              setUser(checkDemoUser())
            }
            setLoading(false)
          }
        })
        subscription = sub?.subscription
      } catch {}
    }

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  return { user, loading }
}