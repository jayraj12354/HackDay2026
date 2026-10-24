import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { CampaignCard } from '@/components/CampaignCard'
import { DemoLogin } from '@/components/DemoLogin'


import { FALLBACK_CAMPAIGNS } from '@/lib/mock-data'

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

    const { data: allInvestments } = await supabase
      .from('investments')
      .select('campaign_id')

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
    <div className="min-h-screen bg-slate-50 selection:bg-amber-100 selection:text-amber-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/80 via-orange-50/40 to-slate-50 border-b border-amber-100/60 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold text-amber-900 shadow-xs backdrop-blur-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>🇮🇳 Built for Pune's Neighbourhood Economy</span>
            </div>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
              Invest in the places <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
                you truly love.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl leading-relaxed text-slate-600 font-normal">
              Your favourite cafe, artisan bakery, and neighbourhood salon can now raise growth funding directly from their loyal customers — not rigid banks.
              Receive monthly revenue-share payouts while helping Pune thrive.
            </p>

            {/* Quick Demo Switcher Card for Hackathon Judges */}
            <div className="mt-8 mx-auto max-w-xl rounded-2xl border border-amber-200/90 bg-white/95 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <span className="text-base">⚡</span>
                  <span><strong>Hackathon Demo Shortcut:</strong> Switch roles instantly:</span>
                </div>
                <DemoLogin />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/campaigns">
                <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-base px-7 h-12 shadow-sm">
                  Browse Active Campaigns →
                </Button>
              </Link>
              <Link href="/create-campaign">
                <Button variant="outline" size="lg" className="border-slate-300 text-slate-700 font-semibold text-base px-7 h-12 hover:bg-slate-100">
                  Raise Funds for Business
                </Button>
              </Link>
            </div>

            {/* Live Trust Metrics */}
            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-amber-200/60 pt-8 text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">₹60L+</p>
                <p className="mt-1 text-xs text-slate-500 font-medium">Community Capital Targeted</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">3 Brands</p>
                <p className="mt-1 text-xs text-slate-500 font-medium">Live Pune Businesses</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">100%</p>
                <p className="mt-1 text-xs text-slate-500 font-medium">AI Compliance Screened</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
            Simplicity & Transparency
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            How CafeStake Works
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Moving away from loan sharks and rigid bank EMIs to aligned community revenue sharing.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {[
            {
              step: '01',
              icon: '📋',
              title: 'Founder Sets the Terms',
              desc: 'A business sets their growth goal (e.g. ₹30 Lakh for a second branch) and offers a compliant revenue-share note vetted by our AI compliance gate.',
            },
            {
              step: '02',
              icon: '☕',
              title: 'Regulars Back the Vision',
              desc: 'Patrons invest manageable ticket sizes — starting at ₹10,000. No diluting equity or giving away voting seats, purely sharing future revenue.',
            },
            {
              step: '03',
              icon: '📈',
              title: 'Everyone Wins Together',
              desc: 'Each month, the business disburses a percentage of its top-line gross revenue back to backers directly until the tenure concludes.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-xs hover:border-amber-300 transition-all duration-300 group hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{item.icon}</span>
                <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-amber-600 transition-colors">
                  STEP {item.step}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Campaigns Section */}
      <section className="bg-white border-y border-slate-200 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                Marketplace
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                Featured Pune Campaigns
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Invest directly in genuine establishments with verified Pune locations.
              </p>
            </div>
            <Link
              href="/campaigns"
              className="text-sm font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 group"
            >
              <span>Explore all campaigns</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns && campaigns.length > 0 ? (
              campaigns.map((campaign) => (
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
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                <p className="text-slate-500 font-medium">No campaigns found.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Comparison: Bank vs CafeStake */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-14 overflow-hidden relative shadow-lg">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              A Superior Financial Model
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
              Why CafeStake beats traditional bank debt
            </h2>
            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              Banks require personal guarantees, mortgage collateral, and fixed monthly compound interest that crushes cash flow during rainy months. CafeStake aligns payments with actual business health.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6">
              <span className="text-red-400 font-bold text-sm">❌ Traditional Bank Loan</span>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>• Rigid fixed EMI regardless of customer footfall</li>
                <li>• Heavy paperwork and asset collateral required</li>
                <li>• Zero community engagement or loyal brand ambassadors</li>
                <li>• Harsh default penalties and compounding interest</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-6">
              <span className="text-amber-400 font-bold text-sm">✓ CafeStake Revenue Share</span>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-200">
                <li>• Payouts fluctuate proportionally with monthly sales</li>
                <li>• Turn 500 loyal regulars into vocal brand promoters</li>
                <li>• AI-assisted compliance review keeps documents legally sound</li>
                <li>• Realtime investor updates and transparent tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}