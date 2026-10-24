import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { CampaignCard } from '@/components/CampaignCard'
import { DemoLogin } from '@/components/DemoLogin'
import { FALLBACK_CAMPAIGNS } from '@/lib/mock-data'
import { ArrowRight, CheckCircle2, TrendingUp, Users, ShieldCheck } from 'lucide-react'

export const instant = false

export default async function HomePage() {
  let campaigns: any[] = []
  const countsByCampaign: Record<string, number> = {}

  try {
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(3)

    if (data && data.length > 0) {
      campaigns = data
    }

    const { data: allInvestments } = await supabase.from('investments').select('campaign_id')

    if (allInvestments) {
      for (const inv of allInvestments) {
        countsByCampaign[inv.campaign_id] = (countsByCampaign[inv.campaign_id] || 0) + 1
      }
    }
  } catch (err) {
    console.warn('Could not query Supabase campaigns, using demo seed data:', err)
  }

  if (campaigns.length === 0) {
    campaigns = FALLBACK_CAMPAIGNS
    countsByCampaign['demo-brew-and-co'] = 24
    countsByCampaign['demo-the-pune-baker'] = 18
    countsByCampaign['demo-glow-studio-salon'] = 31
  }

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-muted-foreground">Built for India's Neighbourhood Economy</span>
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Invest in the places{' '}
              <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                you love.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Local businesses raise growth funding directly from their loyal customers. Earn revenue-share
              payouts while helping your neighbourhood thrive.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link href="/campaigns">
                  Browse Campaigns
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/create-campaign">Raise Funds for Your Business</Link>
              </Button>
            </div>
            <div className="mt-6 flex justify-center">
              <DemoLogin />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Aligned incentives. Transparent terms. Shared success.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Business sets the terms',
              desc: 'Founders define their funding goal, revenue-share offer, and use of funds with AI-assisted compliance checks.',
              icon: CheckCircle2,
            },
            {
              step: '02',
              title: 'Neighbours invest',
              desc: 'Regulars back businesses they love with manageable investments starting at ₹10,000.',
              icon: Users,
            },
            {
              step: '03',
              title: 'Shared growth',
              desc: 'Businesses share a portion of monthly revenue with investors until the agreed terms are met.',
              icon: TrendingUp,
            },
          ].map((item) => (
            <div
              key={item.step}
              className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground tabular-nums">
                  {item.step}
                </span>
              </div>
              <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Featured campaigns</h2>
            <p className="mt-2 text-muted-foreground">Invest in verified local businesses in Pune</p>
          </div>
          <Button asChild variant="ghost" className="gap-2">
            <Link href="/campaigns">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-12">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Built on trust and transparency
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Every campaign goes through AI-assisted compliance screening. Revenue-share terms are clear,
              payouts are tracked transparently, and risks are disclosed upfront.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>AI Compliance Screening</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Transparent Revenue Share</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Clear Risk Disclosure</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
