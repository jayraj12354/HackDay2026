'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatINR } from '@/lib/utils'

export default function PortfolioPage() {
  const router = useRouter()
  const [investments, setInvestments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInvestments = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          campaigns (
            id,
            title,
            category,
            city,
            goal,
            raised
          )
        `)
        .eq('investor_id', user.id)

      if (error) {
        console.error('Error fetching investments:', error)
      } else {
        setInvestments(data || [])
      }
      setLoading(false)
    }

    fetchInvestments()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="h-8 w-64 animate-pulse bg-muted rounded" />
            <div className="h-64 w-full animate-pulse bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My portfolio</h1>
          <p className="text-muted-foreground">
            Your investments in local businesses
          </p>
        </div>

        {investments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't made any investments yet.
              </p>
              <button
                onClick={() => router.push('/campaigns')}
                className="text-primary hover:underline"
              >
                Browse campaigns
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {investments.map((investment) => (
              <Card key={investment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        {investment.campaigns?.title || 'Unknown campaign'}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          {investment.campaigns?.category}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {investment.campaigns?.city}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {formatINR(investment.amount)}
                      </p>
                      <Badge
                        variant={
                          investment.status === 'completed'
                            ? 'default'
                            : 'secondary'
                        }
                        className="mt-1"
                      >
                        {investment.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      Campaign progress:{' '}
                      {investment.campaigns
                        ? `${((investment.campaigns.raised / investment.campaigns.goal) * 100).toFixed(1)}%`
                        : 'N/A'}
                    </span>
                    <span>
                      Invested on:{' '}
                      {new Date(investment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
