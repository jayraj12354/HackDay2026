'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Mode = 'login' | 'signup'

export function AuthForm({ mode }: { mode: Mode }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'owner' | 'investor'>('investor')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role },
            emailRedirectTo: `${window.location.origin}/login`,
          },
        })
        if (signUpError) throw signUpError

        // If session was returned immediately (email confirmation disabled)
        if (data?.session) {
          window.location.href = role === 'owner' ? '/dashboard' : '/portfolio'
          return
        }

        setSuccess(true)
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError

        const userRole = data.user?.user_metadata?.role || 'investor'
        const params = new URLSearchParams(window.location.search)
        const redirect = params.get('redirect') || (userRole === 'owner' ? '/dashboard' : '/portfolio')
        window.location.href = redirect
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="font-semibold text-emerald-800">Account created successfully!</p>
        <p className="mt-2 text-sm text-emerald-700">
          Check your email to confirm your account, then sign in.
        </p>
        <p className="mt-3 text-xs text-emerald-600 bg-emerald-100/60 py-2 px-3 rounded-lg">
          Tip: For instant demo access without email verification, use the <strong>Demo Owner</strong> or <strong>Demo Investor</strong> buttons in the header!
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      {mode === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="role">I am a…</Label>
          <Select
            value={role}
            onValueChange={(v) => setRole((v as 'owner' | 'investor') || 'investor')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="investor">Investor (I want to back local businesses)</SelectItem>
              <SelectItem value="owner">Business Owner (I want to raise funding)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700 border border-red-200">
          {error}
        </div>
      )}
      <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white" disabled={loading}>
        {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
      </Button>
    </form>
  )
}