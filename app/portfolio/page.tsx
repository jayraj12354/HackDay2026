'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { formatINRFull } from '@/lib/utils'
import Link from 'next/link'

export default function PortfolioPage() {
  const { user, loading } = useAuth()
  const [investments, setInvestments] = useState<any[]>([])
  const [loadingInvestments, setLoadingInvestments] = useState(true)

  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    const loadInvestments = async () => {
      try {
        setLoadingInvestments(true)
        let query = supabase
          .from('investments')
          .select('*, campaigns(*)')
          .order('created_at', { ascending: false })

        if (user?.id) {
          query = query.eq('investor_id', user.id)
        }

        const { data, error } = await query
        if (mounted && data && !error) {
          setInvestments(data)
        }
      } catch (e) {
        console.error('Failed to load investments:', e)
      } finally {
        if (mounted) setLoadingInvestments(false)
      }
    }

    loadInvestments()
    return () => {
      mounted = false
    }
  }, [user])

  const handleDemoInvestorSwitch = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithPassword({
      email: 'demo.investor@cafestake.io',
      password: 'Demo1234!',
    })
    window.location.reload()
  }

  if (loading || loadingInvestments) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-600">Loading your portfolio...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'investor') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">
            💰
          </div>
          <h2 className="text-xl font-bold text-slate-900">Investor Portfolio</h2>
          <p className="text-sm text-slate-600">
            Track your stakes in local cafes, bakeries, and neighbourhood stores, alongside upcoming revenue-share payouts.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Button
              onClick={handleDemoInvestorSwitch}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              Sign in as Demo Investor
            </Button>
            <Link href="/campaigns">
              <Button variant="outline" className="w-full">
                Browse Campaigns
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const totalInvested = investments.reduce(
    (sum, inv) => sum + Number(inv.amount || 0),
    0
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                  Verified Backer
                </span>
                <span className="text-xs text-slate-400">Portfolio</span>
              </div>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">
                My Community Stakes
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Logged in as <strong className="text-slate-700">{user.email}</strong>
              </p>
            </div>
            <Link href="/campaigns">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-xs">
                Explore More Campaigns →
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Capital Deployed
            </span>
            <p className="mt-2 text-3xl font-extrabold text-emerald-600">
              {formatINRFull(totalInvested)}
            </p>
            <span className="mt-1 block text-xs text-slate-500">
              Across {investments.length} business stakes
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Stakes
            </span>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">
              {investments.length}
            </p>
            <span className="mt-1 block text-xs text-emerald-600 font-medium">
              ✓ Monthly revenue share active
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Payout Schedule
            </span>
            <p className="mt-2 text-xl font-bold text-slate-900">
              Monthly Distribution
            </p>
            <span className="mt-1 block text-xs text-slate-500">
              Direct to linked UPI / bank account
            </span>
          </div>
        </div>

        {/* Investment Cards */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Your Active Positions</h2>

          {investments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-2xl">
                ☕
              </div>
              <p className="mt-4 text-base font-semibold text-slate-900">No investments yet</p>
              <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                Back a local cafe or bakery in Pune to become a community co-owner and see your stake here.
              </p>
              <Link href="/campaigns" className="mt-6 inline-block">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white font-medium">
                  Browse Campaigns
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {investments.map((inv) => {
                const campaign = inv.campaigns
                if (!campaign) return null
                const progress =
                  (Number(campaign.raised) / Number(campaign.goal || 1)) * 100

                return (
                  <div
                    key={inv.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs font-semibold">
                          {campaign.category}
                        </Badge>
                        <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold px-2 py-0.5 rounded-full">
                          ✓ Confirmed
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-bold text-slate-900">
                        {campaign.title}
                      </h3>
                      <p className="text-xs text-slate-500">{campaign.city}</p>

                      <div className="mt-4 p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl space-y-1">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Your Stake:</span>
                          <span className="font-bold text-amber-900">
                            {formatINRFull(Number(inv.amount))}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Revenue Share:</span>
                          <span className="font-semibold text-slate-900">
                            {campaign.terms?.revenueSharePercent || 5}% pool
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Campaign Progress</span>
                          <span className="font-semibold text-slate-900">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {new Date(inv.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <Link href={`/campaigns/${campaign.id}`}>
                        <Button size="sm" variant="outline" className="text-xs h-8 text-amber-800">
                          Campaign Details →
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
