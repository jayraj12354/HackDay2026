'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CampaignsTable } from '@/components/CampaignsTable'
import { NotificationBell } from '@/components/NotificationBell'
import { InvestorsTable } from '@/components/InvestorsTable'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { formatINRFull } from '@/lib/utils'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)
  const [investors, setInvestors] = useState<any[]>([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadCampaigns = async () => {
      const { data } = await supabase
        .from('campaigns')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
      setCampaigns(data || [])
      setLoadingCampaigns(false)
    }

    loadCampaigns()
  }, [user])

  useEffect(() => {
    if (!selectedCampaign) return

    const loadInvestors = async () => {
      const { data } = await supabase
        .from('investments')
        .select('*, users(email)')
        .eq('campaign_id', selectedCampaign)
        .order('created_at', { ascending: false })
      setInvestors(
        (data || []).map((inv: any) => ({
          ...inv,
          investor_email: inv.users?.email || 'Anonymous',
        }))
      )
    }

    loadInvestors()
  }, [selectedCampaign])

  if (loading || loadingCampaigns) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    )
  }

  if (!user || user.role !== 'owner') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">This page is for business owners only</p>
          <Link href="/">
            <Button className="mt-4">Go home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const totalRaised = campaigns.reduce(
    (sum, c) => sum + Number(c.raised),
    0
  )
  const totalInvestors = campaigns.reduce(
    (sum, c) => sum + (c.investor_count || 0),
    0
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-sm text-slate-500">
                Welcome back, {user.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <Link href="/create-campaign">
                <Button>Create Campaign</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-500">Total Raised</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {formatINRFull(totalRaised)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-500">Campaigns</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {campaigns.length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-500">Total Investors</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalInvestors}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">My Campaigns</h2>
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-6">
            <CampaignsTable campaigns={campaigns} />
          </div>
        </div>

        {selectedCampaign && (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Investors for selected campaign
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCampaign(null)}
              >
                Close
              </Button>
            </div>
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-6">
              <InvestorsTable investors={investors} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
