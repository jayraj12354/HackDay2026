'use client'

import { formatINR } from '@/lib/utils'

interface UseOfFundsProps {
  useOfFunds: Array<{
    item: string
    amountInr: number
    percent: number
  }>
}

export function UseOfFunds({ useOfFunds }: UseOfFundsProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Use of funds</h3>
      <div className="space-y-2">
        {useOfFunds.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
            <div className="flex-1">
              <p className="text-sm font-medium">{item.item}</p>
              <p className="text-xs text-muted-foreground">{item.percent}% of total</p>
            </div>
            <p className="font-semibold">{formatINR(item.amountInr)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
