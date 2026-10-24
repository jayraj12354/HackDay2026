import { NextRequest, NextResponse } from 'next/server'
import { callGemmaJson, GemmaError } from '@/lib/ai'
import { SYSTEM_PROMPTS } from '@/lib/prompts'
import { ComplianceCheckSchema } from '@/lib/validate'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { campaignText } = await req.json()

    if (!campaignText) {
      return NextResponse.json(
        { error: 'Campaign text is required for compliance screening' },
        { status: 400 }
      )
    }

    const compliance = await callGemmaJson(ComplianceCheckSchema, {
      system: SYSTEM_PROMPTS.complianceCheck,
      messages: [{ role: 'user', content: campaignText }],
      max_tokens: 2500,
      temperature: 0.2,
    })

    return NextResponse.json({ success: true, compliance, source: 'gemma' })
  } catch (error: unknown) {
    console.error('Compliance check error:', error)
    const message =
      error instanceof GemmaError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Compliance screening failed'
    const status = error instanceof GemmaError ? error.status : 500
    return NextResponse.json({ error: message }, { status })
  }
}
