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

  const handleDemo = async (email: string, password: string, role: string) => {
    setLoading(email)
    setError(null)
    try {
      // Call server API to ensure demo user exists
      const res = await fetch('/api/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Demo login failed')
      }

      // Sign in with the credentials
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      window.location.href = role === 'owner' ? '/dashboard' : '/portfolio'
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
          onClick={() => handleDemo(a.email, a.password, a.role)}
        >
          {loading === a.email ? '…' : a.role === 'owner' ? 'Demo owner' : 'Demo investor'}
        </Button>
      ))}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}