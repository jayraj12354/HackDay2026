'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export function DemoLogin() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDemo = async (role: 'owner' | 'investor') => {
    setLoading(role)
    setError(null)
    try {
      const res = await fetch('/api/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Demo login setup failed')
      }

      const supabase = createClient()
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      if (signInErr) throw signInErr

      // Force full reload so cookies take effect on server components
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