'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { CampaignDetail } from '@/components/CampaignDetail'
import { InvestModal } from '@/components/InvestModal'
import { InvestSuccess } from '@/components/InvestSuccess'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

import { FALLBACK_CAMPAIGNS } from '@/lib/mock-data'

function CampaignDetailContent() {
  const params = useParams()
  const router = useRouter()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [investModalOpen, setInvestModalOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [investedAmount, setInvestedAmount] = useState(0)

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error || !data) {
          // 1. Check local demo campaigns created by user
          if (typeof window !== 'undefined') {
            try {
              const locals = JSON.parse(localStorage.getItem('cafestake_local_campaigns') || '[]')
              const foundLocal = locals.find((c: any) => c.id === params.id)
              if (foundLocal) {
                setCampaign({ ...foundLocal, investorCount: 0 })
                return
              }
            } catch {}
          }

          // 2. Check fallback seeded campaigns
          const fallback =
            FALLBACK_CAMPAIGNS.find((c) => c.id === params.id) || FALLBACK_CAMPAIGNS[0]
          if (fallback) {
            setCampaign({ ...fallback, investorCount: 24 })
            return
          }
          router.push('/campaigns')
          return
        }

        // Also fetch investor count for this campaign
        const { count } = await supabase
          .from('investments')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', params.id)

        setCampaign({
          ...data,
          investorCount: count || 0,
        })
      } catch (err) {
        console.error('Fetch campaign failed:', err)
        router.push('/campaigns')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCampaign()
    }
  }, [params.id, router])

  const handleInvest = () => {
    setInvestModalOpen(true)
  }

  const handleInvestSuccess = (amount: number) => {
    setInvestedAmount(amount)
    setCampaign((prev: any) => ({
      ...prev,
      raised: Number(prev?.raised || 0) + Number(amount),
      investorCount: (prev?.investorCount || 0) + 1,
    }))
    setInvestModalOpen(false)
    setShowSuccess(true)
  }

  const handleViewPortfolio = () => {
    router.push('/portfolio')
  }

  const handleBackToCampaign = () => {
    setShowSuccess(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md">
          <h2 className="text-xl font-bold text-slate-900">Campaign Not Found</h2>
          <p className="mt-2 text-sm text-slate-600">The campaign you are looking for does not exist or has been removed.</p>
          <Link href="/campaigns" className="mt-6 inline-block">
            <Button>Browse Active Campaigns</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
        <InvestSuccess
          amount={investedAmount}
          campaignTitle={campaign.title}
          onViewPortfolio={handleViewPortfolio}
          onBackToCampaign={handleBackToCampaign}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/campaigns"
            className="inline-flex items-center text-sm font-medium text-amber-800 hover:text-amber-900 transition"
          >
            ← Back to all campaigns
          </Link>
          <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-medium">
            📍 {campaign.city}
          </span>
        </div>

        <CampaignDetail
          campaign={{
            id: campaign.id,
            title: campaign.title,
            tagline: campaign.tagline,
            category: campaign.category,
            city: campaign.city,
            story: campaign.story,
            goal: Number(campaign.goal),
            raised: Number(campaign.raised),
            minTicket: Number(campaign.min_ticket),
            investorCount: campaign.investorCount,
            useOfFunds: Array.isArray(campaign.use_of_funds) ? campaign.use_of_funds : [],
            terms: campaign.terms || {},
            faqs: Array.isArray(campaign.faqs) ? campaign.faqs : [],
            riskSummary: Array.isArray(campaign.risk_summary) ? campaign.risk_summary : [],
            offerDocument: campaign.offer_document,
          }}
          onInvest={handleInvest}
        />
      </div>

      <InvestModal
        open={investModalOpen}
        onClose={() => setInvestModalOpen(false)}
        onSuccess={handleInvestSuccess}
        minTicket={Number(campaign.min_ticket) || 10000}
        campaignTitle={campaign.title}
        campaignId={campaign.id}
      />
    </div>
  )
}

export default function CampaignDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Skeleton className="h-8 w-64" />
          </div>
        </div>
      }
    >
      <CampaignDetailContent />
    </Suspense>
  )
}
