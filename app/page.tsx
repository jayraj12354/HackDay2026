import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { formatINRFull } from '@/lib/utils'

export const instant = false

export default async function HomePage() {
  const supabase = await createSupabaseServerClient()
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(3)
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              🇮🇳 Built for Indian local businesses
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Invest in the places you love.
            </h1>
            <p className="mt-6 text-lg leading-7 text-slate-600">
              Your favourite cafe, bakery and salon can grow with money from the
              people who already love them — not a bank. Join a community of
              neighbours backing the businesses that make Pune special.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/campaigns">
                <Button size="lg">Browse campaigns</Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" size="lg">Start an account</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900">
          How it works
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              step: '1',
              title: 'Business sets the terms',
              desc: 'A cafe decides how much it needs, what it will offer, and what the money will go toward.',
            },
            {
              step: '2',
              title: 'Customers invest small amounts',
              desc: 'Regulars invest a manageable ticket — like ₹10,000 — and become part-owners through a revenue-share note.',
            },
            {
              step: '3',
              title: 'Everyone shares in the upside',
              desc: 'The business pays a share of monthly revenue back to investors. Everyone wins when the business grows.',
            },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800">
                {item.step}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Featured campaigns</h2>
          <Link href="/campaigns" className="text-sm font-medium text-amber-700 hover:underline">
            See all →
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns && campaigns.length > 0 ? (
            campaigns.map((campaign) => {
              const progress = (Number(campaign.raised) / Number(campaign.goal)) * 100
              return (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.id}`}
                  className="group block rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-amber-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                      {campaign.category}
                    </span>
                    <span className="text-xs text-slate-500">{campaign.city}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900 group-hover:text-amber-700">
                    {campaign.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">{campaign.tagline}</p>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-900">
                        {formatINRFull(Number(campaign.raised))}
                      </span>
                      <span className="text-slate-500">
                        of {formatINRFull(Number(campaign.goal))}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-amber-600 transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>{progress.toFixed(0)}% funded</span>
                      <span>Min {formatINRFull(Number(campaign.min_ticket))}</span>
                    </div>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <p className="text-slate-500">
                Campaigns will appear here once the database is seeded.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Run <code className="rounded bg-slate-100 px-1">npx tsx supabase/seed.ts</code> to load demo data.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}