'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { formatINRFull } from '@/lib/utils'
import Link from 'next/link'

export default function PortfolioPage() {
  const { user, loading } = useAuth()
  const [investments, setInvestments] = useState<any[]>([])
  const [loadingInvestments, setLoadingInvestments] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadInvestments = async () => {
      const { data } = await supabase
        .from('investments')
        .select('*, campaigns(*)')
        .eq('investor_id', user.id)
        .order('created_at', { ascending: false })
      setInvestments(data || [])
      setLoadingInvestments(false)
    }

    loadInvestments()
  }, [user])

  if (loading || loadingInvestments) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    )
  }

  if (!user || user.role !== 'investor') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">This page is for investors only</p>
          <Link href="/">
            <Button className="mt-4">Go home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const totalInvested = investments.reduce(
    (sum, inv) => sum + Number(inv.amount),
    0
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">My Portfolio</h1>
              <p className="text-sm text-slate-500">
                Your investments in local businesses
              </p>
            </div>
            <Link href="/campaigns">
              <Button>Browse Campaigns</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-500">Total Invested</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatINRFull(totalInvested)}
          </p>
        </div>

        <h2 className="text-lg font-semibold text-slate-900">Your Investments</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {investments.length === 0 ? (
            <div className="col-span-full rounded-lg border border-dashed border-slate-300 p-12 text-center">
              <p className="text-slate-500">No investments yet</p>
              <p className="mt-1 text-sm text-slate-400">
                Start investing in local businesses to see them here
              </p>
              <Link href="/campaigns" className="mt-4 inline-block">
                <Button>Browse Campaigns</Button>
              </Link>
            </div>
          ) : (
            investments.map((investment) => {
              const campaign = investment.campaigns
              const progress = campaign
                ? (Number(campaign.raised) / Number(campaign.goal)) * 100
                : 0
              return (
                <Link
                  key={investment.id}
                  href={`/campaigns/${investment.campaign_id}`}
                  className="group block rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-amber-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <Badge className="bg-amber-100 text-amber-800">
                      {campaign?.category}
                    </Badge>
                    <Badge
                      variant={
                        investment.status === 'completed'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {investment.status}
                    </Badge>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900 group-hover:text-amber-700">
                    {campaign?.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {campaign?.tagline}
                  </p>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-900">
                        {formatINRFull(Number(investment.amount))}
                      </span>
                      <span className="text-slate-500">
                        {campaign ? formatINRFull(Number(campaign.goal)) : '-'}
                      </span>
                    </div>
                    {campaign && (
                      <>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full bg-amber-600 transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          {progress.toFixed(0)}% funded
                        </div>
                      </>
                    )}
                  </div>
                  <div className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                    Invested on{' '}
                    {new Date(investment.created_at).toLocaleDateString()}
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
