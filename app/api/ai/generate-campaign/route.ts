import { NextRequest, NextResponse } from 'next/server'
import { callGemmaJson, GemmaError } from '@/lib/ai'
import { SYSTEM_PROMPTS } from '@/lib/prompts'
import { GenerateCampaignSchema } from '@/lib/validate'

export const maxDuration = 60

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

    if (!businessName || !businessType) {
      return NextResponse.json(
        { error: 'Business name and category are required' },
        { status: 400 }
      )
    }

    const prompt = `Write a unique GrowFund campaign for this specific business. Do not reuse generic expansion copy.

Business Name: ${businessName}
Business Category: ${businessType}
City: ${city}
Amount to raise: ₹${amountNeeded}
Min ticket size: ₹${ticketSize}
Proposed terms: ${revenueSharePercent}% monthly revenue share for ${tenureMonths} months
Purpose of funds: ${purpose}

Use these numbers in useOfFunds and terms. Make the story specific to ${businessName} in ${city}.`

    const campaign = await callGemmaJson(GenerateCampaignSchema, {
      system: SYSTEM_PROMPTS.generateCampaign,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.7,
    })

    return NextResponse.json({ success: true, campaign, source: 'gemma' })
  } catch (error: unknown) {
    console.error('Generate campaign error:', error)
    const message =
      error instanceof GemmaError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Failed to generate campaign draft'
    const status = error instanceof GemmaError ? error.status : 500
    return NextResponse.json({ error: message }, { status })
  }
}
