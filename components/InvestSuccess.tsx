'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatINR } from '@/lib/utils'

interface InvestSuccessProps {
  amount: number
  campaignTitle: string
  onViewPortfolio: () => void
  onBackToCampaign: () => void
}

export function InvestSuccess({
  amount,
  campaignTitle,
  onViewPortfolio,
  onBackToCampaign,
}: InvestSuccessProps) {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <CardTitle className="text-2xl">Investment successful!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">You invested</p>
          <p className="text-3xl font-bold">{formatINR(amount)}</p>
          <p className="text-sm text-muted-foreground">in {campaignTitle}</p>
        </div>
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-900">
          <p className="font-medium">Demo investment</p>
          <p className="text-xs mt-1">
            This is a simulated investment. No real money was transferred.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onBackToCampaign}>
            Back to campaign
          </Button>
          <Button className="flex-1" onClick={onViewPortfolio}>
            View portfolio
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
