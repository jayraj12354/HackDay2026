'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      const { data } = await supabase.auth.getUser()
      if (mounted) {
        setUser(
          data.user
            ? {
                id: data.user.id,
                email: data.user.email,
                role: data.user.user_metadata?.role || 'investor',
              }
            : null
        )
        setLoading(false)
      }
    }
    load()

    const { data: sub } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (mounted) {
        setUser(
          session?.user
            ? {
                id: session.user.id,
                email: session.user.email,
                role: session.user.user_metadata?.role || 'investor',
              }
            : null
        )
      }
    })
    return () => {
      mounted = false
      sub?.subscription?.unsubscribe()
    }
  }, [])

  return { user, loading }
}