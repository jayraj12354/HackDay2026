import { createClient } from '@/lib/supabase-server'
import { CampaignCard } from '@/components/CampaignCard'

export default async function CampaignsPage() {
  const supabase = await createClient()

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse campaigns</h1>
          <p className="text-muted-foreground">
            Invest in local businesses you love
          </p>
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
                goal={campaign.goal}
                raised={campaign.raised}
                minTicket={campaign.min_ticket}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No campaigns available yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
