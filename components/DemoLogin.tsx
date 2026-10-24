'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export function DemoLogin() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const demoAccounts = [
    { email: 'demo.owner@cafestake.io', password: 'Demo1234!', role: 'owner' },
    { email: 'demo.investor@cafestake.io', password: 'Demo1234!', role: 'investor' },
  ]

  const handleDemo = async (email: string, password: string) => {
    setLoading(email)
    setError(null)
    try {
      const { error: err1 } = await supabase.auth.signUp({ email, password })
      if (err1) {
        const { error: err2 } = await supabase.auth.signInWithPassword({ email, password })
        if (err2) throw err2
      } else {
        await supabase.auth.signInWithPassword({ email, password })
      }
      window.location.href = email.includes('owner') ? '/dashboard' : '/portfolio'
    } catch (e: any) {
      setError(e.message || 'Demo login failed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {demoAccounts.map((a) => (
        <Button
          key={a.email}
          size="sm"
          variant="outline"
          disabled={loading === a.email}
          onClick={() => handleDemo(a.email, a.password)}
        >
          {loading === a.email ? '…' : a.role === 'owner' ? 'Demo owner' : 'Demo investor'}
        </Button>
      ))}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}