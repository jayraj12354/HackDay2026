'use client'

import { useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export function DemoLogin() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDemo = async (role: 'owner' | 'investor') => {
    setLoading(role)
    setError(null)
    try {
      const email = role === 'owner' ? 'demo.owner@cafestake.io' : 'demo.investor@cafestake.io'
      const mockUser = {
        id: role === 'owner' ? 'demo-owner-id' : 'demo-investor-id',
        email,
        role,
      }

      let resData: any = null
      try {
        const res = await fetch('/api/demo-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role }),
        })
        if (res.ok) {
          resData = await res.json()
        }
      } catch (fetchErr) {
        console.warn('Demo login fetch failed, continuing with client fallback')
      }

      // If Supabase is configured and reachable, attempt standard sign-in
      if (isSupabaseConfigured) {
        try {
          const supabase = createClient()
          await supabase.auth.signInWithPassword({
            email,
            password: resData?.password || 'Demo1234!',
          })
        } catch (authErr) {
          console.warn('Supabase sign-in skipped/failed:', authErr)
        }
      }

      // Always save demo user locally for instantaneous zero-failure demo switching
      if (typeof window !== 'undefined') {
        localStorage.setItem('cafestake_demo_user', JSON.stringify(mockUser))
        document.cookie = `cafestake_demo_user=${encodeURIComponent(
          JSON.stringify(mockUser)
        )}; path=/; max-age=86400; SameSite=Lax`
      }

      // Full reload so all components hydrate with the selected role
      window.location.href = role === 'owner' ? '/dashboard' : '/portfolio'
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Demo login failed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        className="h-8 border-amber-300 bg-amber-50/70 text-amber-900 hover:bg-amber-100 text-xs font-semibold px-2.5"
        disabled={!!loading}
        onClick={() => handleDemo('owner')}
      >
        {loading === 'owner' ? 'Signing in…' : '👔 Demo Owner'}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8 border-emerald-300 bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100 text-xs font-semibold px-2.5"
        disabled={!!loading}
        onClick={() => handleDemo('investor')}
      >
        {loading === 'investor' ? 'Signing in…' : '💰 Demo Investor'}
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}