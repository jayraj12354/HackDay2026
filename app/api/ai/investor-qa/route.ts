import { NextRequest, NextResponse } from 'next/server'
import { callGemma, GemmaError } from '@/lib/ai'
import { SYSTEM_PROMPTS } from '@/lib/prompts'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { question, offerDocument } = await req.json()

    if (!question || !offerDocument) {
      return NextResponse.json(
        { error: 'Question and offerDocument are required' },
        { status: 400 }
      )
    }

    const response = await callGemma({
      system: SYSTEM_PROMPTS.investorQA,
      messages: [
        {
          role: 'user',
          content: `Offer Document:\n${offerDocument}\n\nQuestion: ${question}`,
        },
      ],
      max_tokens: 700,
      temperature: 0.3,
    })

    return NextResponse.json({ response, source: 'gemma' })
  } catch (error: unknown) {
    console.error('Investor QA error:', error)
    const message =
      error instanceof GemmaError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Failed to get answer'
    const status = error instanceof GemmaError ? error.status : 500
    return NextResponse.json({ error: message }, { status })
  }
}
