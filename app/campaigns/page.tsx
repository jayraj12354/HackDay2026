import { createSupabaseServerClient } from '@/lib/supabase-server'
import { CampaignCard } from '@/components/CampaignCard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'


import { FALLBACK_CAMPAIGNS } from '@/lib/mock-data'

export const instant = false

interface PageProps {
  searchParams?: Promise<{ category?: string }>
}

export default async function CampaignsPage(props: PageProps) {
  const searchParams = await props.searchParams
  const selectedCategory = searchParams?.category || 'All'

  let campaigns: any[] = []
  const countsByCampaign: Record<string, number> = {}

  try {
    const supabase = await createSupabaseServerClient()

    let query = supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (selectedCategory && selectedCategory !== 'All') {
      query = query.eq('category', selectedCategory)
    }

    const { data } = await query
    if (data && data.length > 0) {
      campaigns = data
    }

    // Also get investment counts
    const { data: allInvestments } = await supabase
      .from('investments')
      .select('campaign_id')

    if (allInvestments) {
      for (const inv of allInvestments) {
        countsByCampaign[inv.campaign_id] = (countsByCampaign[inv.campaign_id] || 0) + 1
      }
    }
  } catch (err) {
    console.warn('Could not query Supabase campaigns for feed:', err)
  }

  if (campaigns.length === 0) {
    campaigns =
      selectedCategory && selectedCategory !== 'All'
        ? FALLBACK_CAMPAIGNS.filter((c) => c.category.toLowerCase() === selectedCategory.toLowerCase())
        : FALLBACK_CAMPAIGNS
    countsByCampaign['demo-brew-and-co'] = 24
    countsByCampaign['demo-the-pune-baker'] = 18
    countsByCampaign['demo-glow-studio-salon'] = 31
  }

  const categories = ['All', 'Cafe', 'Bakery', 'Salon', 'Restaurant']

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 mb-3">
              <span>☕</span> Community-backed local businesses
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Explore Active Campaigns
            </h1>
            <p className="mt-2 text-slate-600 max-w-xl">
              Back Pune's finest independent cafes, bakeries, and neighbourhood stores with revenue-share investments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/create-campaign">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-xs">
                + Launch a Campaign
              </Button>
            </Link>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat
            return (
              <Link
                key={cat}
                href={cat === 'All' ? '/campaigns' : `/campaigns?category=${encodeURIComponent(cat)}`}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </Link>
            )
          })}
        </div>

        {campaigns && campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                id={campaign.id}
                title={campaign.title}
                tagline={campaign.tagline}
                category={campaign.category}
                city={campaign.city}
                goal={Number(campaign.goal)}
                raised={Number(campaign.raised)}
                minTicket={Number(campaign.min_ticket)}
                investorCount={countsByCampaign[campaign.id] || 0}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-2xl">
              🔍
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No campaigns found</h3>
            <p className="mt-1 text-sm text-slate-500">
              There are currently no active campaigns in the "{selectedCategory}" category.
            </p>
            <div className="mt-6">
              <Link href="/campaigns">
                <Button variant="outline">View All Campaigns</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
