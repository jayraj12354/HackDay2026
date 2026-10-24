import { NextRequest, NextResponse } from 'next/server'
import { callGemma, extractJson } from '@/lib/ai'
import { SYSTEM_PROMPTS } from '@/lib/prompts'
import { GenerateCampaignSchema } from '@/lib/validate'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      businessName,
      businessType,
      city = 'Pune',
      amountNeeded = 2500000,
      purpose = 'Open a second branch and upgrade kitchen equipment',
      ticketSize = 10000,
      revenueSharePercent = 6,
      tenureMonths = 36,
    } = body

    const prompt = `Business Name: ${businessName}
Business Category: ${businessType}
City: ${city}
Amount to raise: ₹${amountNeeded}
Min ticket size: ₹${ticketSize}
Proposed terms: ${revenueSharePercent}% monthly revenue share for ${tenureMonths} months
Purpose of funds: ${purpose}`

    // Attempt Google Gemma 4 (31B) via OpenRouter
    const gemmaResult = await callGemma({
      system: SYSTEM_PROMPTS.generateCampaign,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 3000,
      enableReasoning: true,
    })

    if (gemmaResult) {
      try {
        const parsed = extractJson(gemmaResult)
        const validated = GenerateCampaignSchema.parse(parsed)
        return NextResponse.json({ success: true, campaign: validated })
      } catch (parseErr) {
        console.warn('Failed to parse Gemma output, using intelligent generator:', parseErr)
      }
    }

    // High quality intelligent generator fallback if API key is not yet set or returns error
    const totalGoal = Number(amountNeeded) || 2500000
    const leaseAmt = Math.round(totalGoal * 0.4)
    const equipAmt = Math.round(totalGoal * 0.35)
    const workAmt = Math.round(totalGoal * 0.15)
    const mktgAmt = totalGoal - leaseAmt - equipAmt - workAmt

    const fallbackCampaign = {
      title: `${businessName || 'Artisan Corner'} — Expansion in ${city}`,
      tagline: `Bringing authentic ${businessType.toLowerCase() || 'specialty food'} to more neighbours in ${city}`,
      story: `${businessName || 'Our brand'} has been proudly serving the local community with high quality craft offerings. Over the past years, our regular patrons have turned our store into a beloved neighbourhood staple.\n\nNow, with customer demand at an all-time high, we are expanding our presence in ${city}. Rather than taking on rigid high-interest bank debt, we are inviting our most loyal regulars to back our growth and participate directly in our revenue upside.\n\nEvery rupee raised will go towards securing our prime expansion space, procuring state-of-the-art commercial equipment, and welcoming our community to a bigger, better experience.`,
      useOfFunds: [
        { item: 'Premises Lease Deposit & Civil Setup', amountInr: leaseAmt, percent: 40 },
        { item: 'Commercial Equipment & Interior Furnishing', amountInr: equipAmt, percent: 35 },
        { item: 'Working Capital & Inventory', amountInr: workAmt, percent: 15 },
        { item: 'Launch Marketing & Initial Staffing', amountInr: mktgAmt, percent: 10 },
      ],
      terms: {
        revenueSharePercent: Number(revenueSharePercent) || 6,
        tenureMonths: Number(tenureMonths) || 36,
        payoutFrequency: 'monthly',
      },
      faqs: [
        {
          q: 'How does the monthly revenue share work?',
          a: `Every month, ${revenueSharePercent}% of the outlet's verified gross revenue is pooled and distributed proportionally among all participating investors.`,
        },
        {
          q: 'When do investor payouts begin?',
          a: 'Payouts commence within 30 days after the new location opens its doors for business.',
        },
        {
          q: 'What is the risk of capital loss?',
          a: 'Like all small business investments, returns depend on actual customer footfall. Returns are not guaranteed, and in the worst case of closure, you may lose part of your investment.',
        },
      ],
      offerDocument: `COMMUNITY INVESTMENT OFFERING MEMORANDUM\n\nIssuer: ${businessName || 'The Company'}\nLocation: ${city}, Maharashtra\nTarget Capital: ₹${totalGoal.toLocaleString('en-IN')}\nInstrument: Revenue-Share Note\n\n1. BUSINESS SUMMARY\n${businessName || 'The Company'} is an established local ${businessType.toLowerCase()} with a proven operating history. This round finances strategic retail expansion.\n\n2. REVENUE SHARE STRUCTURE\nThe Issuer agrees to disburse ${revenueSharePercent}% of aggregate gross retail revenue each month across a ${tenureMonths}-month tenure. Payouts are transferred electronically to verified investor accounts.\n\n3. USE OF CAPITAL\nFunds are strictly allocated to lease commitments (40%), professional gear (35%), initial inventory (15%), and marketing (10%).\n\n4. RISK FACTORS & DISCLOSURES\nInvestment in small enterprises involves substantial business risk. Payments fluctuate with seasonal trading conditions. This offering is unrated and uninsured. Early redemption is not permissible, though secondary assignment may be approved by CafeStake governance.`,
    }

    return NextResponse.json({ success: true, campaign: fallbackCampaign })
  } catch (error: any) {
    console.error('Generate campaign error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate campaign draft' },
      { status: 500 }
    )
  }
}
