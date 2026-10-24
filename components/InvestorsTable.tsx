'use client'

import { formatINRFull } from '@/lib/utils'

interface InvestorsTableProps {
  investors: any[]
}

export function InvestorsTable({ investors }: InvestorsTableProps) {
  if (investors.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
        <p className="text-slate-500">No investors yet</p>
        <p className="mt-1 text-sm text-slate-400">
          Investors will appear here once they invest in your campaign
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 text-left text-sm font-medium text-slate-500">
            <th className="pb-3">Investor</th>
            <th className="pb-3">Amount</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {investors.map((investment) => (
            <tr key={investment.id} className="border-b border-slate-100">
              <td className="py-4">
                <p className="font-medium text-slate-900">
                  {investment.investor_email || 'Anonymous'}
                </p>
              </td>
              <td className="py-4 font-medium text-slate-900">
                {formatINRFull(Number(investment.amount))}
              </td>
              <td className="py-4">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    investment.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {investment.status}
                </span>
              </td>
              <td className="py-4 text-slate-600">
                {new Date(investment.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
