'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { CampaignDetail } from '@/components/CampaignDetail'
import { InvestModal } from '@/components/InvestModal'
import { InvestSuccess } from '@/components/InvestSuccess'
import { Skeleton } from '@/components/ui/skeleton'

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [investModalOpen, setInvestModalOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [investedAmount, setInvestedAmount] = useState(0)

  useEffect(() => {
    const fetchCampaign = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', params.id)
        .eq('status', 'published')
        .single()

      if (error || !data) {
        router.push('/campaigns')
        return
      }

      setCampaign(data)
      setLoading(false)
    }

    fetchCampaign()
  }, [params.id, router])

  const handleInvest = () => {
    setInvestModalOpen(true)
  }

  const handleInvestSuccess = (amount: number) => {
    setInvestedAmount(amount)
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <CampaignDetail
          campaign={{
            id: campaign.id,
            title: campaign.title,
            tagline: campaign.tagline,
            category: campaign.category,
            city: campaign.city,
            story: campaign.story,
            goal: campaign.goal,
            raised: campaign.raised,
            minTicket: campaign.min_ticket,
            investorCount: 0,
            useOfFunds: campaign.use_of_funds,
            terms: campaign.terms,
            faqs: campaign.faqs,
            riskSummary: campaign.risk_summary,
          }}
          onInvest={handleInvest}
        />
      </div>
      <InvestModal
        open={investModalOpen}
        onClose={() => setInvestModalOpen(false)}
        onSuccess={() => handleInvestSuccess(campaign.min_ticket)}
        minTicket={campaign.min_ticket}
        campaignTitle={campaign.title}
      />
    </div>
  )
}
