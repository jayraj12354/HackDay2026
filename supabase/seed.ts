import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('Service Role Key:', supabaseServiceKey ? 'Set (length: ' + supabaseServiceKey.length + ')' : 'Missing')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

async function seed() {
  console.log('🌱 Seeding CafeStake database...')

  // Test connectivity
  try {
    console.log('Testing Supabase connection...')
    const { data, error } = await supabase.from('campaigns').select('count')
    if (error) {
      console.error('Connection test failed:', error)
      return
    }
    console.log('✓ Connection successful')
  } catch (e) {
    console.error('Connection test threw error:', e)
    return
  }

  // Get or create demo users
  let ownerId: string | undefined
  let investorId: string | undefined

  // Try to get existing users first
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const ownerUser = users.find(u => u.email === 'demo.owner@cafestake.io')
  const investorUser = users.find(u => u.email === 'demo.investor@cafestake.io')

  if (ownerUser) {
    ownerId = ownerUser.id
    console.log('✓ Found existing demo owner')
  } else {
    const { data: ownerData, error: ownerError } = await supabase.auth.admin.createUser({
      email: 'demo.owner@cafestake.io',
      password: 'Demo1234!',
      email_confirm: true,
      user_metadata: { role: 'owner' },
    })
    if (ownerError) {
      console.error('Error creating owner:', ownerError)
    } else {
      ownerId = ownerData.user?.id
      console.log('✓ Created demo owner')
    }
  }

  if (investorUser) {
    investorId = investorUser.id
    console.log('✓ Found existing demo investor')
  } else {
    const { data: investorData, error: investorError } = await supabase.auth.admin.createUser({
      email: 'demo.investor@cafestake.io',
      password: 'Demo1234!',
      email_confirm: true,
      user_metadata: { role: 'investor' },
    })
    if (investorError) {
      console.error('Error creating investor:', investorError)
    } else {
      investorId = investorData.user?.id
      console.log('✓ Created demo investor')
    }
  }

  if (!ownerId || !investorId) {
    console.error('Failed to get users, exiting')
    return
  }

  // Create demo campaigns
  const campaigns = [
    {
      owner_id: ownerId,
      title: 'Brew & Co - Koregaon Park',
      tagline: 'Artisan coffee in Pune since 2018',
      category: 'Cafe',
      city: 'Pune',
      goal: 3000000,
      raised: 1800000,
      min_ticket: 10000,
      status: 'published',
      story: 'Brew & Co started as a small corner cafe in Koregaon Park in 2018. We built our reputation on single-origin beans and a welcoming space for students and professionals. Our loyal customers visit daily — many of them have asked how they can help us grow. Now we want to open a second outlet in Viman Nagar to reach more of Pune.',
      use_of_funds: [
        { item: 'Lease deposit for Viman Nagar outlet', amountInr: 1200000, percent: 40 },
        { item: 'Equipment (espresso machines, grinders)', amountInr: 900000, percent: 30 },
        { item: 'Interior design and furniture', amountInr: 600000, percent: 20 },
        { item: 'Working capital for first 3 months', amountInr: 300000, percent: 10 },
      ],
      terms: {
        revenueSharePercent: 5,
        tenureMonths: 36,
        payoutFrequency: 'monthly',
      },
      faqs: [
        { q: 'When do I start receiving returns?', a: 'Returns start from the first month after the outlet opens and begins generating revenue.' },
        { q: 'What happens if the outlet doesn\'t perform well?', a: 'Returns are revenue-share based, so you only receive payments when the business earns. There is no guaranteed minimum return.' },
        { q: 'Can I withdraw my investment early?', a: 'No, this is a 36-month commitment. You cannot withdraw early, but you may transfer your position to another investor with approval.' },
      ],
      offer_document: `Brew & Co - Revenue Share Note Offering

This offer is for a revenue share note in Brew & Co, a Pune-based cafe operating since 2018.

Business: Brew & Co currently operates one outlet in Koregaon Park, Pune. We serve artisan coffee, light meals and have built a loyal customer base through quality products and consistent service.

Use of Funds: The ₹30,00,000 raised will be used to open a second outlet in Viman Nagar. This includes lease deposit (₹12,00,000), equipment (₹9,00,000), interior work (₹6,00,000) and working capital (₹3,00,000).

Returns: Investors receive 5% of monthly revenue from the Viman Nagar outlet, paid monthly for 36 months. Returns are tied to actual business performance — there is no guaranteed minimum.

Risks: Business performance depends on footfall, competition and economic conditions. Revenue may be lower than projected. In case of business closure, investors may lose part or all of their capital. This investment is not insured and cannot be withdrawn early. Transfer of the note requires approval.

Exit: After 36 months, the note matures and no further returns are paid. There is no buyback guarantee from the business.`,
      risk_summary: [
        'Returns depend on actual business performance — there is no guaranteed minimum',
        'You may lose part or all of your capital if the business underperforms or closes',
        'This investment is not insured by any government or private scheme',
        'You cannot withdraw early — funds are locked for 36 months',
        'Transfer of your position requires approval and may be difficult',
        'Business risk: new outlet may not achieve projected revenue',
      ],
    },
    {
      owner_id: ownerId,
      title: 'The Pune Baker',
      tagline: 'Handmade sourdough and cakes since 2016',
      category: 'Bakery',
      city: 'Pune',
      goal: 1500000,
      raised: 900000,
      min_ticket: 5000,
      status: 'published',
      story: 'The Pune Baker began in a home kitchen in 2016 when our founder started selling sourdough at the local farmers market. Today we have a small shop in Kothrud with a cult following for our sourdough loaves, croissants and custom cakes. We need funds to expand production capacity and launch an online delivery service.',
      use_of_funds: [
        { item: 'Commercial oven and proofing cabinets', amountInr: 600000, percent: 40 },
        { item: 'Delivery van and branding', amountInr: 300000, percent: 20 },
        { item: 'Website and app development', amountInr: 225000, percent: 15 },
        { item: 'Hiring 2 additional bakers', amountInr: 375000, percent: 25 },
      ],
      terms: {
        revenueSharePercent: 4,
        tenureMonths: 24,
        payoutFrequency: 'monthly',
      },
      faqs: [
        { q: 'How are returns calculated?', a: 'Returns are 4% of monthly gross revenue from all sales, including in-store and delivery.' },
        { q: 'What if the online launch fails?', a: 'We have a strong in-store business that generates steady revenue. Returns will continue from that base.' },
        { q: 'Is there a minimum return guarantee?', a: 'No, returns are purely revenue-share based. In low-revenue months, you may receive less.' },
      ],
      offer_document: `The Pune Baker - Revenue Share Note Offering

This offer is for a revenue share note in The Pune Baker, a bakery operating in Kothrud, Pune since 2016.

Business: The Pune Baker operates a retail bakery known for sourdough bread, pastries and custom cakes. We sell through our shop and are launching online delivery.

Use of Funds: The ₹15,00,000 raised will fund expansion: commercial equipment (₹6,00,000), delivery van (₹3,00,000), online platform (₹2,25,000) and hiring (₹3,75,000).

Returns: Investors receive 4% of monthly gross revenue from all channels, paid monthly for 24 months. Returns are performance-based with no minimum guarantee.

Risks: Food business has high competition and perishable inventory. Revenue fluctuates seasonally. In case of closure, capital loss is possible. No insurance or early withdrawal. Transfer requires approval.

Exit: Note matures after 24 months. No buyback guarantee.`,
      risk_summary: [
        'Returns are revenue-share only — no guaranteed minimum',
        'Capital loss possible if business underperforms or closes',
        'Not insured by any scheme',
        '24-month lock-in with no early withdrawal',
        'Transfer requires approval and may be restricted',
        'Competition from other bakeries and cafes',
      ],
    },
    {
      owner_id: ownerId,
      title: 'Glow Studio Salon',
      tagline: 'Premium beauty services in Baner',
      category: 'Salon',
      city: 'Pune',
      goal: 5000000,
      raised: 3500000,
      min_ticket: 25000,
      status: 'published',
      story: 'Glow Studio Salon opened in Baner in 2020 and quickly became known for skilled stylists and a relaxing atmosphere. Our team of 12 serves over 200 clients monthly with hair, skin and wellness services. We are at capacity in our current space and want to expand to a larger location in the same area to add more stations and a spa section.',
      use_of_funds: [
        { item: 'Lease deposit for larger space', amountInr: 2000000, percent: 40 },
        { item: 'Salon equipment and furniture', amountInr: 1500000, percent: 30 },
        { item: 'Spa equipment (steam room, massage tables)', amountInr: 1000000, percent: 20 },
        { item: 'Marketing and launch campaign', amountInr: 500000, percent: 10 },
      ],
      terms: {
        revenueSharePercent: 6,
        tenureMonths: 48,
        payoutFrequency: 'monthly',
      },
      faqs: [
        { q: 'What services does the expansion include?', a: 'We are adding a spa section with massage, facials and body treatments, plus more hair and beauty stations.' },
        { q: 'How do I receive my returns?', a: 'Returns are 6% of monthly revenue, transferred to your bank account on the 5th of each month.' },
        { q: 'What if the new location doesn\'t attract clients?', a: 'We have a strong existing client base and will cross-promote. However, revenue may be lower than projected in the first year.' },
      ],
      offer_document: `Glow Studio Salon - Revenue Share Note Offering

This offer is for a revenue share note in Glow Studio Salon, a premium salon in Baner, Pune since 2020.

Business: Glow Studio Salon provides hair, skin and wellness services with a team of 12 professionals serving 200+ monthly clients. We are expanding to a larger location to add spa services.

Use of Funds: The ₹50,00,000 raised funds expansion: lease deposit (₹20,00,000), salon equipment (₹15,00,000), spa equipment (₹10,00,000) and marketing (₹5,00,000).

Returns: Investors receive 6% of monthly revenue, paid monthly for 48 months. Returns are tied to actual performance with no minimum guarantee.

Risks: Service business depends on customer retention and operator skill. New location may have slower uptake. Capital loss possible if business fails. No insurance or early withdrawal. Transfer requires approval.

Exit: Note matures after 48 months. No buyback guarantee.`,
      risk_summary: [
        'Returns depend on business performance — no minimum guarantee',
        'Capital loss possible if business underperforms or closes',
        'Not insured by any scheme',
        '48-month lock-in with no early withdrawal',
        'Transfer requires approval',
        'Service business risk: customer retention and staff turnover',
      ],
    },
  ]

  for (const campaign of campaigns) {
    const { error } = await supabase.from('campaigns').insert(campaign)
    if (error) {
      console.error('Error inserting campaign:', error)
    } else {
      console.log(`✓ Created campaign: ${campaign.title}`)
    }
  }

  // Create demo investments
  const { data: campaignData } = await supabase.from('campaigns').select('id').eq('status', 'published')
  if (campaignData && campaignData.length >= 2) {
    const investments = [
      { campaign_id: campaignData[0].id, investor_id: investorId, amount: 10000, status: 'completed' },
      { campaign_id: campaignData[1].id, investor_id: investorId, amount: 25000, status: 'completed' },
    ]

    for (const investment of investments) {
      const { error } = await supabase.from('investments').insert(investment)
      if (error) {
        console.error('Error inserting investment:', error)
      } else {
        console.log(`✓ Created investment: ₹${investment.amount}`)
      }
    }
  }

  console.log('✅ Seed complete!')
  console.log('Demo accounts:')
  console.log('  Owner: demo.owner@cafestake.io / Demo1234!')
  console.log('  Investor: demo.investor@cafestake.io / Demo1234!')
}

seed().catch(console.error)
