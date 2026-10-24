'use client'

import { Badge } from '@/components/ui/badge'
import { formatINRFull } from '@/lib/utils'

interface CampaignsTableProps {
  campaigns: any[]
}

export function CampaignsTable({ campaigns }: CampaignsTableProps) {
  if (campaigns.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
        <p className="text-slate-500">No campaigns yet</p>
        <p className="mt-1 text-sm text-slate-400">
          Create your first campaign to start raising funds
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 text-left text-sm font-medium text-slate-500">
            <th className="pb-3">Campaign</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Raised</th>
            <th className="pb-3">Goal</th>
            <th className="pb-3">Investors</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => {
            const progress = (Number(campaign.raised) / Number(campaign.goal)) * 100
            return (
              <tr key={campaign.id} className="border-b border-slate-100">
                <td className="py-4">
                  <div>
                    <p className="font-medium text-slate-900">{campaign.title}</p>
                    <p className="text-sm text-slate-500">{campaign.city}</p>
                  </div>
                </td>
                <td className="py-4">
                  <Badge
                    variant={
                      campaign.status === 'published'
                        ? 'default'
                        : campaign.status === 'draft'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {campaign.status}
                  </Badge>
                </td>
                <td className="py-4">
                  <span className="font-medium text-slate-900">
                    {formatINRFull(Number(campaign.raised))}
                  </span>
                  <span className="ml-2 text-sm text-slate-500">
                    ({progress.toFixed(0)}%)
                  </span>
                </td>
                <td className="py-4 text-slate-600">
                  {formatINRFull(Number(campaign.goal))}
                </td>
                <td className="py-4 text-slate-600">
                  {campaign.investor_count || 0}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
