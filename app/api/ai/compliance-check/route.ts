import { NextRequest, NextResponse } from 'next/server'
import { callAnthropic } from '@/lib/ai'
import { SYSTEM_PROMPTS } from '@/lib/prompts'
import { ComplianceCheckSchema } from '@/lib/validate'

export async function POST(req: NextRequest) {
  try {
    const { campaignText } = await req.json()

    if (!campaignText) {
      return NextResponse.json(
        { error: 'Campaign text is required for compliance screening' },
        { status: 400 }
      )
    }

    // Attempt Anthropic Claude Sonnet
    const claudeResult = await callAnthropic({
      system: SYSTEM_PROMPTS.complianceCheck,
      messages: [{ role: 'user', content: campaignText }],
      max_tokens: 2000,
    })

    if (claudeResult) {
      try {
        const cleaned = claudeResult.replace(/```json/g, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(cleaned)
        const validated = ComplianceCheckSchema.parse(parsed)
        return NextResponse.json({ success: true, compliance: validated })
      } catch (parseErr) {
        console.warn('Failed to parse Claude output, using rule-based compliance check:', parseErr)
      }
    }

    // Rule-based compliance screening
    const flags: Array<{ phrase: string; problem: string; suggestedRewrite: string }> = []
    const lower = campaignText.toLowerCase()

    const prohibitedPatterns = [
      {
        regex: /guaranteed|guarantee/i,
        phrase: 'guaranteed returns',
        problem: 'Promising guaranteed returns violates community finance and investor disclosure norms.',
        suggestedRewrite: 'targeted performance-linked returns',
      },
      {
        regex: /risk[- ]?free|zero risk/i,
        phrase: 'risk-free',
        problem: 'Claiming an uncollateralized retail business investment is risk-free is misleading.',
        suggestedRewrite: 'subject to normal retail business operating risks',
      },
      {
        regex: /100% safe|assured income/i,
        phrase: '100% safe',
        problem: 'Overstating capital safety without banking deposit insurance is prohibited.',
        suggestedRewrite: 'structured as a transparent community revenue-share note',
      },
      {
        regex: /last chance|hurry up|only few spots/i,
        phrase: 'last chance / hurry up',
        problem: 'High-pressure urgency tactics are non-compliant.',
        suggestedRewrite: 'community campaign open during this funding cycle',
      },
    ]

    for (const pattern of prohibitedPatterns) {
      if (pattern.regex.test(campaignText)) {
        flags.push({
          phrase: pattern.phrase,
          problem: pattern.problem,
          suggestedRewrite: pattern.suggestedRewrite,
        })
      }
    }

    const missingDisclosures: string[] = []
    if (!lower.includes('loss') && !lower.includes('risk')) {
      missingDisclosures.push('Explicit disclosure regarding risk of partial or total capital loss')
    }
    if (!lower.includes('insurance') && !lower.includes('uninsured')) {
      missingDisclosures.push('Statement clarifying this is uncollateralized and not insured by banking guarantees')
    }
    if (!lower.includes('withdraw') && !lower.includes('illiquid')) {
      missingDisclosures.push('Notice of investment illiquidity and restriction on early withdrawals')
    }

    const investorRiskSummary = [
      'Returns depend entirely on monthly customer revenues and are not guaranteed.',
      'Small retail food and service businesses face competition, lease changes, and cost inflation.',
      'This investment note is unrated, unsecured, and not covered by deposit insurance (DICGC).',
      'Capital is committed for the stated tenure and cannot be liquidated on demand.',
      'In the rare event of business dissolution, senior creditors take precedence over revenue notes.',
    ]

    const passed = flags.length === 0

    return NextResponse.json({
      success: true,
      compliance: {
        passed,
        flags,
        missingDisclosures,
        investorRiskSummary,
      },
    })
  } catch (error: any) {
    console.error('Compliance check error:', error)
    return NextResponse.json(
      { error: error.message || 'Compliance screening failed' },
      { status: 500 }
    )
  }
}
