'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface RiskSummaryBoxProps {
  riskSummary: string[]
}

export function RiskSummaryBox({ riskSummary }: RiskSummaryBoxProps) {
  return (
    <Alert variant="destructive" className="border-orange-200 bg-orange-50 text-orange-900">
      <AlertTitle className="font-semibold text-orange-900">
        Risks to know before investing
      </AlertTitle>
      <AlertDescription className="mt-2">
        <ul className="list-disc list-inside space-y-1 text-sm">
          {riskSummary.map((risk, idx) => (
            <li key={idx}>{risk}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}
