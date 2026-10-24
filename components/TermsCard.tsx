'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TermsCardProps {
  terms: {
    revenueSharePercent: number
    tenureMonths: number
    payoutFrequency: string
  }
}

export function TermsCard({ terms }: TermsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Revenue share terms</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Revenue share</span>
            <span className="font-semibold">{terms.revenueSharePercent}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tenure</span>
            <span className="font-semibold">{terms.tenureMonths} months</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payout frequency</span>
            <span className="font-semibold capitalize">{terms.payoutFrequency}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
