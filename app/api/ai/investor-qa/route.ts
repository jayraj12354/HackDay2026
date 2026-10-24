import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { question, offerDocument } = await req.json()

    if (!question || !offerDocument) {
      return NextResponse.json(
        { error: 'Question and offerDocument are required' },
        { status: 400 }
      )
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-5-5',
      max_tokens: 1024,
      system: `You are the CafeStake investor Q&A assistant. You help people understand a specific campaign.

RULES:
- Answer ONLY from the offer document provided. Do not use outside knowledge.
- If the answer is not in the document, say EXACTLY: "That isn't covered in this offer. Please ask the business owner."
- NEVER give personal investment advice. Do NOT say "you should invest" or "you shouldn't invest".
- Keep answers short, warm, and in simple language.
- Reply in the SAME language the user writes in (Hindi, Marathi, English, etc.). If they write in Hinglish, reply in Hinglish.
- Do not speculate beyond what the document says.

The offer document is below.`,
      messages: [
        {
          role: 'user',
          content: `Offer Document:\n${offerDocument}\n\nQuestion: ${question}`,
        },
      ],
    })

    const response =
      message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Investor QA error:', error)
    return NextResponse.json(
      { error: 'Failed to get answer' },
      { status: 500 }
    )
  }
}
