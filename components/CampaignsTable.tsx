'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatINRFull } from '@/lib/utils'
import Link from 'next/link'

interface CampaignsTableProps {
  campaigns: any[]
  selectedCampaignId?: string | null
  onSelectCampaign?: (id: string) => void
}

export function CampaignsTable({
  campaigns,
  selectedCampaignId,
  onSelectCampaign,
}: CampaignsTableProps) {
  if (campaigns.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
        <p className="text-slate-500 font-medium">No campaigns created yet</p>
        <p className="mt-1 text-xs text-slate-400">
          Launch your first campaign with our AI assistant to start raising community capital
        </p>
        <Link href="/create-campaign" className="mt-4 inline-block">
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
            + Create Campaign
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th className="pb-3">Campaign</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Raised</th>
            <th className="pb-3">Goal</th>
            <th className="pb-3">Investors</th>
            <th className="pb-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {campaigns.map((campaign) => {
            const progress = (Number(campaign.raised) / Number(campaign.goal || 1)) * 100
            const isSelected = selectedCampaignId === campaign.id

            return (
              <tr
                key={campaign.id}
                className={`transition-colors hover:bg-amber-50/40 ${
                  isSelected ? 'bg-amber-50/80' : ''
                }`}
              >
                <td className="py-4 font-medium text-slate-900">
                  <Link
                    href={`/campaigns/${campaign.id}`}
                    className="hover:text-amber-700 font-semibold flex items-center gap-2"
                  >
                    <span>{campaign.title}</span>
                    <span className="text-xs text-slate-400 font-normal">({campaign.city})</span>
                  </Link>
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
                    className="text-xs capitalize font-semibold"
                  >
                    {campaign.status}
                  </Badge>
                </td>
                <td className="py-4">
                  <span className="font-bold text-amber-700">
                    {formatINRFull(Number(campaign.raised))}
                  </span>
                  <span className="ml-1.5 text-xs text-slate-500">
                    ({progress.toFixed(0)}%)
                  </span>
                </td>
                <td className="py-4 text-slate-600 font-medium">
                  {formatINRFull(Number(campaign.goal))}
                </td>
                <td className="py-4 font-medium text-slate-700">
                  {campaign.investor_count ?? campaign.investorCount ?? 0}
                </td>
                <td className="py-4 text-right space-x-2">
                  {onSelectCampaign && (
                    <Button
                      size="sm"
                      variant={isSelected ? 'default' : 'outline'}
                      className={`text-xs h-8 ${
                        isSelected ? 'bg-amber-600 text-white' : ''
                      }`}
                      onClick={() => onSelectCampaign(campaign.id)}
                    >
                      {isSelected ? 'Viewing Investors' : 'View Investors'}
                    </Button>
                  )}
                  <Link href={`/campaigns/${campaign.id}`}>
                    <Button size="sm" variant="ghost" className="text-xs h-8 text-amber-700">
                      Public View →
                    </Button>
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
