import { z } from 'zod'

export const CampaignSchema = z.object({
  title: z.string().min(2).max(120),
  tagline: z.string().min(5).max(200),
  story: z.string().min(50).max(5000),
  useOfFunds: z
    .array(
      z.object({
        item: z.string().min(1),
        amountInr: z.number().min(0),
        percent: z.number().min(0).max(100),
      })
    )
    .min(1),
  terms: z.object({
    revenueSharePercent: z.number().min(0).max(100),
    tenureMonths: z.number().min(1).max(120),
    payoutFrequency: z.string().min(1),
  }),
  faqs: z
    .array(
      z.object({
        q: z.string().min(1),
        a: z.string().min(1),
      })
    ),
  offerDocument: z.string().min(100),
  riskSummary: z.array(z.string()).min(3).max(8),
})

export const ComplianceCheckSchema = z.object({
  passed: z.boolean(),
  flags: z.array(
    z.object({
      phrase: z.string(),
      problem: z.string(),
      suggestedRewrite: z.string(),
    })
  ),
  missingDisclosures: z.array(z.string()),
  investorRiskSummary: z.array(z.string()).min(3).max(8),
})

export const GenerateCampaignSchema = z.object({
  title: z.string(),
  tagline: z.string(),
  story: z.string(),
  useOfFunds: z.array(
    z.object({
      item: z.string(),
      amountInr: z.number(),
      percent: z.number(),
    })
  ),
  terms: z.object({
    revenueSharePercent: z.number(),
    tenureMonths: z.number(),
    payoutFrequency: z.string(),
  }),
  faqs: z.array(
    z.object({
      q: z.string(),
      a: z.string(),
    })
  ),
  offerDocument: z.string(),
})

export const InvestorQASchema = z.object({
  answer: z.string(),
})

export type Campaign = z.infer<typeof CampaignSchema>
export type ComplianceCheck = z.infer<typeof ComplianceCheckSchema>
export type GenerateCampaign = z.infer<typeof GenerateCampaignSchema>