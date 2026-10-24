'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { UseOfFunds } from '@/components/UseOfFunds'
import { TermsCard } from '@/components/TermsCard'
import { RiskSummaryBox } from '@/components/RiskSummaryBox'
import { FAQSection } from '@/components/FAQSection'
import { formatINR } from '@/lib/utils'

interface CampaignDetailProps {
  campaign: {
    id: string
    title: string
    tagline: string
    category: string
    city: string
    story: string
    goal: number
    raised: number
    minTicket: number
    investorCount?: number
    useOfFunds: Array<{
      item: string
      amountInr: number
      percent: number
    }>
    terms: {
      revenueSharePercent: number
      tenureMonths: number
      payoutFrequency: string
    }
    faqs: Array<{
      q: string
      a: string
    }>
    riskSummary: string[]
  }
  onInvest: () => void
}

export function CampaignDetail({ campaign, onInvest }: CampaignDetailProps) {
  const progress = (campaign.raised / campaign.goal) * 100

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{campaign.category}</Badge>
          <span className="text-sm text-muted-foreground">{campaign.city}</span>
        </div>
        <h1 className="text-3xl font-bold">{campaign.title}</h1>
        <p className="text-lg text-muted-foreground">{campaign.tagline}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Funding progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Raised</span>
                <span className="font-semibold text-lg">
                  {formatINR(campaign.raised)} / {formatINR(campaign.goal)}
                </span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-muted-foreground mt-1">
                {progress.toFixed(1)}% funded
              </p>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {campaign.investorCount || 0} investors
              </span>
              <span className="text-muted-foreground">
                Minimum investment: {formatINR(campaign.minTicket)}
              </span>
            </div>
            <Button onClick={onInvest} className="w-full" size="lg">
              Invest {formatINR(campaign.minTicket)}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About this business</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-line">{campaign.story}</p>
        </CardContent>
      </Card>

      <UseOfFunds useOfFunds={campaign.useOfFunds} />
      <TermsCard terms={campaign.terms} />
      <RiskSummaryBox riskSummary={campaign.riskSummary} />
      <FAQSection faqs={campaign.faqs} />
    </div>
  )
}
