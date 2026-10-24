'use client'

import { useEffect, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { CampaignsTable } from '@/components/CampaignsTable'
import { NotificationBell } from '@/components/NotificationBell'
import { InvestorsTable } from '@/components/InvestorsTable'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { formatINRFull } from '@/lib/utils'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [investors, setInvestors] = useState<any[]>([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)
  const [loadingInvestors, setLoadingInvestors] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Load campaigns
  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    const loadCampaigns = async () => {
      try {
        setLoadingCampaigns(true)
        // If owner is logged in, show their campaigns or all published campaigns
        let query = supabase.from('campaigns').select('*').order('created_at', { ascending: false })

        if (user?.id) {
          query = query.or(`owner_id.eq.${user.id},status.eq.published`)
        }

        const { data, error } = await query
        if (mounted && data && !error) {
          // Fetch investment counts for each campaign
          const { data: invs } = await supabase.from('investments').select('campaign_id')
          const counts: Record<string, number> = {}
          if (invs) {
            for (const i of invs) {
              counts[i.campaign_id] = (counts[i.campaign_id] || 0) + 1
            }
          }

          const enhanced = data.map((c) => ({
            ...c,
            investorCount: counts[c.id] || 0,
          }))

          setCampaigns(enhanced)
          if (enhanced.length > 0 && !selectedCampaignId) {
            setSelectedCampaignId(enhanced[0].id)
          }
        }
      } catch (e) {
        console.error('Error loading campaigns:', e)
      } finally {
        if (mounted) setLoadingCampaigns(false)
      }
    }

    loadCampaigns()
    return () => {
      mounted = false
    }
  }, [user])

  // Load investors for selected campaign
  useEffect(() => {
    if (!selectedCampaignId) return
    let mounted = true
    const supabase = createClient()

    const loadInvestors = async () => {
      setLoadingInvestors(true)
      try {
        const { data, error } = await supabase
          .from('investments')
          .select('*')
          .eq('campaign_id', selectedCampaignId)
          .order('created_at', { ascending: false })

        if (mounted && data && !error) {
          setInvestors(
            data.map((inv: any) => ({
              ...inv,
              investor_email: inv.investor_email || 'demo.investor@cafestake.io',
            }))
          )
        }
      } catch (e) {
        console.error('Error loading investors:', e)
      } finally {
        if (mounted) setLoadingInvestors(false)
      }
    }

    loadInvestors()
    return () => {
      mounted = false
    }
  }, [selectedCampaignId])

  const handleDemoOwnerSwitch = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithPassword({
      email: 'demo.owner@cafestake.io',
      password: 'Demo1234!',
    })
    window.location.reload()
  }

  if (loading || loadingCampaigns) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-600">Loading Business Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'owner') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl">
            👔
          </div>
          <h2 className="text-xl font-bold text-slate-900">Business Owner Portal</h2>
          <p className="text-sm text-slate-600">
            This dashboard is dedicated to business founders managing their campaigns, investors, and payout schedules.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Button
              onClick={handleDemoOwnerSwitch}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
            >
              Sign in as Demo Owner
            </Button>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const totalRaised = campaigns.reduce((sum, c) => sum + Number(c.raised || 0), 0)
  const totalInvestors = campaigns.reduce((sum, c) => sum + (c.investorCount || 0), 0)
  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId)

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Dashboard Top Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
                  Business Owner
                </span>
                <span className="text-xs text-slate-400">Live Workspace</span>
              </div>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">
                Founder Dashboard
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Logged in as <strong className="text-slate-700">{user.email}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />
              <Link href="/create-campaign">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs">
                  + Create New Campaign
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Community Capital Raised
            </span>
            <p className="mt-2 text-3xl font-extrabold text-amber-600">
              {formatINRFull(totalRaised)}
            </p>
            <span className="mt-1 block text-xs text-slate-500">
              Across {campaigns.length} active campaigns
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Active Campaigns
            </span>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">
              {campaigns.length}
            </p>
            <span className="mt-1 block text-xs text-emerald-600 font-medium">
              ✓ All campaigns live on marketplace
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Community Investors
            </span>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">
              {totalInvestors}
            </p>
            <span className="mt-1 block text-xs text-slate-500">
              Backers sharing monthly revenue
            </span>
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Campaigns</h2>
              <p className="text-xs text-slate-500">Select a campaign to view participating investors below</p>
            </div>
            <Link href="/create-campaign">
              <Button size="sm" variant="outline" className="text-xs">
                Launch Another
              </Button>
            </Link>
          </div>

          <CampaignsTable
            campaigns={campaigns}
            selectedCampaignId={selectedCampaignId}
            onSelectCampaign={(id) => setSelectedCampaignId(id)}
          />
        </div>

        {/* Selected Campaign Investors Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Backers for {selectedCampaign ? `"${selectedCampaign.title}"` : 'Campaign'}
              </h2>
              <p className="text-xs text-slate-500">
                {investors.length} confirmed investment notes registered in Supabase
              </p>
            </div>
            {selectedCampaign && (
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full">
                Raised: {formatINRFull(Number(selectedCampaign.raised))}
              </span>
            )}
          </div>

          {loadingInvestors ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading backers...</div>
          ) : (
            <InvestorsTable investors={investors} />
          )}
        </div>
      </main>
    </div>
  )
}
