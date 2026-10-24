'use client'

import { formatINRFull } from '@/lib/utils'

interface InvestorsTableProps {
  investors: any[]
}

export function InvestorsTable({ investors }: InvestorsTableProps) {
  if (investors.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center bg-slate-50">
        <p className="text-slate-500 font-medium text-sm">No recorded investors for this campaign yet</p>
        <p className="mt-1 text-xs text-slate-400">
          When community backers invest from the public campaign page, they will appear here in real time.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
            <th className="pb-3">Investor</th>
            <th className="pb-3">Investment Amount</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {investors.map((investment) => (
            <tr key={investment.id} className="hover:bg-slate-50/60">
              <td className="py-3.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">
                    👤
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {investment.investor_email || 'demo.investor@cafestake.io'}
                    </p>
                    <span className="text-xs text-slate-400">Verified backer</span>
                  </div>
                </div>
              </td>
              <td className="py-3.5 font-bold text-emerald-700">
                {formatINRFull(Number(investment.amount))}
              </td>
              <td className="py-3.5">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200">
                  ✓ {investment.status || 'confirmed'}
                </span>
              </td>
              <td className="py-3.5 text-xs text-slate-500">
                {new Date(investment.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
