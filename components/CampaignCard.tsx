'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatINR } from '@/lib/utils'

interface CampaignCardProps {
  id: string
  title: string
  tagline: string
  category: string
  city: string
  goal: number
  raised: number
  minTicket: number
  investorCount?: number
}

export function CampaignCard({
  id,
  title,
  tagline,
  category,
  city,
  goal,
  raised,
  minTicket,
  investorCount = 0,
}: CampaignCardProps) {
  const progress = (raised / goal) * 100

  return (
    <Link href={`/campaigns/${id}`}>
      <Card className="h-full transition-all hover:shadow-lg cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <Badge variant="secondary" className="mb-2">
                {category}
              </Badge>
              <h3 className="font-semibold text-lg leading-tight">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{tagline}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{city}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Raised</span>
                <span className="font-medium">
                  {formatINR(raised)} / {formatINR(goal)}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {investorCount} {investorCount === 1 ? 'investor' : 'investors'}
              </span>
              <span className="text-muted-foreground">
                Min: {formatINR(minTicket)}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-md text-sm font-medium transition-colors">
            View details
          </button>
        </CardFooter>
      </Card>
    </Link>
  )
}
