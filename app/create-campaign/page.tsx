'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { formatINRFull } from '@/lib/utils'
import Link from 'next/link'

export default function CreateCampaignPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // Wizard state: 1 = Pitch, 2 = Draft, 3 = Compliance, 4 = Publishing
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Step 1: Rough Pitch Form State
  const [businessName, setBusinessName] = useState('Zenith Roast Cafe')
  const [businessType, setBusinessType] = useState('Cafe')
  const [city, setCity] = useState('Pune')
  const [amountNeeded, setAmountNeeded] = useState('2500000')
  const [ticketSize, setTicketSize] = useState('10000')
  const [purpose, setPurpose] = useState('Opening second branch in Baner with an artisan brew lab')
  const [revenueSharePercent, setRevenueSharePercent] = useState('6')
  const [tenureMonths, setTenureMonths] = useState('36')

  // Step 2: AI Generated Draft State
  const [isGenerating, setIsGenerating] = useState(false)
  const [draft, setDraft] = useState<any>(null)

  // Step 3: AI Compliance Gate State
  const [isCheckingCompliance, setIsCheckingCompliance] = useState(false)
  const [complianceResult, setComplianceResult] = useState<any>(null)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)

  // Handler: Generate Draft with AI
  const handleGenerateDraft = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    try {
      const res = await fetch('/api/ai/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          businessType,
          city,
          amountNeeded: Number(amountNeeded),
          ticketSize: Number(ticketSize),
          purpose,
          revenueSharePercent: Number(revenueSharePercent),
          tenureMonths: Number(tenureMonths),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      setDraft(data.campaign)
      setStep(2)
    } catch (err: any) {
      alert(err.message || 'Failed to generate campaign')
    } finally {
      setIsGenerating(false)
    }
  }

  // Handler: Run Compliance Check
  const handleRunCompliance = async () => {
    setIsCheckingCompliance(true)
    try {
      const fullText = `${draft.title}\n${draft.tagline}\n${draft.story}\n${draft.offerDocument}`
      const res = await fetch('/api/ai/compliance-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignText: fullText }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Compliance check failed')

      setComplianceResult(data.compliance)
      setStep(3)
    } catch (err: any) {
      alert(err.message || 'Failed to run compliance screen')
    } finally {
      setIsCheckingCompliance(false)
    }
  }

  // Handler: Apply rewrite to draft
  const handleApplyRewrite = (phrase: string, rewrite: string) => {
    if (!draft) return
    const updatedStory = draft.story.replace(new RegExp(phrase, 'gi'), rewrite)
    const updatedOffer = draft.offerDocument.replace(new RegExp(phrase, 'gi'), rewrite)
    setDraft({ ...draft, story: updatedStory, offerDocument: updatedOffer })

    // Update compliance flags locally
    setComplianceResult((prev: any) => ({
      ...prev,
      flags: prev.flags.filter((f: any) => f.phrase !== phrase),
      passed: prev.flags.length <= 1,
    }))
  }

  // Handler: Publish Campaign to Supabase
  const handlePublish = async () => {
    setIsPublishing(true)
    setPublishError(null)

    try {
      const ownerId = user?.id || 'demo-owner-id'

      const newCampaignData = {
        owner_id: ownerId,
        title: draft.title,
        tagline: draft.tagline,
        story: draft.story,
        category: businessType,
        city: city,
        goal: Number(amountNeeded),
        raised: 0,
        min_ticket: Number(ticketSize),
        status: 'published',
        use_of_funds: draft.useOfFunds || [],
        terms: draft.terms || {
          revenueSharePercent: Number(revenueSharePercent),
          tenureMonths: Number(tenureMonths),
          payoutFrequency: 'monthly',
        },
        faqs: draft.faqs || [],
        offer_document: draft.offerDocument,
        risk_summary: complianceResult?.investorRiskSummary || [
          'Returns are based on revenue and not guaranteed.',
          'Small businesses carry operating and market risks.',
          'Illiquid instrument with no early redemption.',
        ],
      }

      let campaignId = 'camp-' + Date.now()

      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('campaigns')
          .insert(newCampaignData)
          .select()
          .single()

        if (!error && data?.id) {
          campaignId = data.id
        }
      } catch (dbErr) {
        console.warn('Supabase publish network request failed, using local storage:', dbErr)
      }

      // Always save to local demo storage so newly generated campaigns are immediately viewable
      const fullCampaign = {
        id: campaignId,
        ...newCampaignData,
        created_at: new Date().toISOString(),
      }

      if (typeof window !== 'undefined') {
        try {
          const existing = JSON.parse(localStorage.getItem('cafestake_local_campaigns') || '[]')
          localStorage.setItem(
            'cafestake_local_campaigns',
            JSON.stringify([fullCampaign, ...existing.filter((c: any) => c.id !== campaignId)])
          )
        } catch {}
      }

      router.push(`/campaigns/${campaignId}`)
    } catch (err: any) {
      console.error(err)
      setPublishError(err.message || 'Failed to publish campaign to database')
      setIsPublishing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Wizard Header Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-sm font-medium text-amber-800 hover:underline">
              ← Return to Dashboard
            </Link>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full">
              4-Step Campaign Builder
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
            Create a Community Campaign
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Raise growth capital directly from your regular patrons using our AI-assisted compliance wizard.
          </p>

          <div className="mt-6 flex items-center justify-between border-b border-slate-200 pb-4">
            {[
              { num: 1, title: '1. Pitch Inputs' },
              { num: 2, title: '2. AI Draft & Review' },
              { num: 3, title: '3. Compliance Gate' },
              { num: 4, title: '4. Publish' },
            ].map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-2 text-sm font-semibold ${
                  step === s.num
                    ? 'text-amber-600'
                    : step > s.num
                    ? 'text-emerald-600'
                    : 'text-slate-400'
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    step === s.num
                      ? 'bg-amber-600 text-white'
                      : step > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </div>
                <span className="hidden sm:inline">{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: Rough Pitch Form */}
        {step === 1 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Tell us about your business & goals</h2>
              <p className="text-sm text-slate-500">
                Provide basic details. Gemma AI will generate a complete compliant offer document, breakdown of funds, and terms for you.
              </p>
            </div>

            <form onSubmit={handleGenerateDraft} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bname">Business Name</Label>
                  <Input
                    id="bname"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="btype">Category</Label>
                  <Select value={businessType} onValueChange={(val) => setBusinessType(val || 'Cafe')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cafe">Cafe / Coffee Bar</SelectItem>
                      <SelectItem value="Bakery">Artisan Bakery</SelectItem>
                      <SelectItem value="Salon">Salon & Wellness</SelectItem>
                      <SelectItem value="Restaurant">Bistro / Restaurant</SelectItem>
                      <SelectItem value="Gym">Fitness Studio / Gym</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City / Locality</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Funding Goal (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amountNeeded}
                    onChange={(e) => setAmountNeeded(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ticket">Min Ticket Size (₹)</Label>
                  <Input
                    id="ticket"
                    type="number"
                    value={ticketSize}
                    onChange={(e) => setTicketSize(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="revshare">Monthly Revenue Share (%)</Label>
                  <Input
                    id="revshare"
                    type="number"
                    value={revenueSharePercent}
                    onChange={(e) => setRevenueSharePercent(e.target.value)}
                    min={1}
                    max={20}
                    required
                  />
                  <p className="text-xs text-slate-500">Typical range: 4% - 10% of monthly sales</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tenure">Tenure (Months)</Label>
                  <Input
                    id="tenure"
                    type="number"
                    value={tenureMonths}
                    onChange={(e) => setTenureMonths(e.target.value)}
                    required
                  />
                  <p className="text-xs text-slate-500">Typical duration: 24 to 48 months</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="purpose">Expansion Purpose & Story Highlights</Label>
                <Textarea
                  id="purpose"
                  rows={3}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. We have been running at 100% table capacity in Koregaon Park and want to take over an 1800 sq ft space in Baner..."
                  required
                />
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 flex items-center justify-between">
                <span>
                  ✨ Our AI will enforce compliant, unexaggerated language adhering to community finance norms.
                </span>
                <span className="font-semibold text-amber-800">Model: Google Gemma 4 (31B)</span>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isGenerating}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Generating with AI...
                    </span>
                  ) : (
                    'Generate Campaign Draft with AI ✨'
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: Editable AI Draft */}
        {step === 2 && draft && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Review & Refine AI Draft</h2>
                  <p className="text-sm text-slate-500">
                    You can freely edit any field below before passing to the compliance gate.
                  </p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                  AI Draft Generated
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Campaign Title</Label>
                  <Input
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Tagline</Label>
                  <Input
                    value={draft.tagline}
                    onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Campaign Story</Label>
                  <Textarea
                    rows={6}
                    value={draft.story}
                    onChange={(e) => setDraft({ ...draft, story: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-slate-900">Use of Funds Breakdown</Label>
                  <div className="space-y-2">
                    {draft.useOfFunds?.map((fund: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-sm">
                        <span className="flex-1 font-medium">{fund.item}</span>
                        <span className="text-amber-700 font-bold">{formatINRFull(fund.amountInr)}</span>
                        <span className="text-xs text-slate-500">({fund.percent}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Official Offering Document (Plain text memorandum)</Label>
                  <Textarea
                    rows={8}
                    value={draft.offerDocument}
                    onChange={(e) => setDraft({ ...draft, offerDocument: e.target.value })}
                    className="font-mono text-xs bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <Button variant="outline" onClick={() => setStep(1)}>
                  ← Back to Pitch
                </Button>
                <Button
                  onClick={handleRunCompliance}
                  disabled={isCheckingCompliance}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                >
                  {isCheckingCompliance ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Auditing Compliance...
                    </span>
                  ) : (
                    'Run AI Compliance Gate →'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Compliance Gate */}
        {step === 3 && complianceResult && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">AI Compliance Screening</h2>
                <p className="text-sm text-slate-500">
                  Automated regulatory check for investor protection and risk disclosures.
                </p>
              </div>
              {complianceResult.passed ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-sm font-bold text-emerald-800">
                  ✓ Ready to Publish
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3.5 py-1 text-sm font-bold text-red-800">
                  ⚠️ Needs Changes
                </span>
              )}
            </div>

            {/* Flagged phrases table */}
            {complianceResult.flags?.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 text-sm">Flagged Phrases Requiring Amendment</h3>
                <div className="overflow-x-auto rounded-xl border border-red-200 bg-red-50/50">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-red-200 bg-red-100/60 font-semibold text-red-900">
                        <th className="p-3">Problematic Phrase</th>
                        <th className="p-3">Compliance Violation</th>
                        <th className="p-3">Suggested Compliant Rewrite</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-200">
                      {complianceResult.flags.map((flag: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-3 font-medium text-red-900">"{flag.phrase}"</td>
                          <td className="p-3 text-red-700">{flag.problem}</td>
                          <td className="p-3 font-semibold text-emerald-800">"{flag.suggestedRewrite}"</td>
                          <td className="p-3 text-right">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7"
                              onClick={() => handleApplyRewrite(flag.phrase, flag.suggestedRewrite)}
                            >
                              Apply Rewrite
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 flex items-center gap-3">
                <span className="text-lg">🎉</span>
                <span>
                  <strong>Zero non-compliant claims found!</strong> No guaranteed returns or urgency pressure were detected.
                </span>
              </div>
            )}

            {/* Generated Investor Risk Summary */}
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 text-sm">
                Investor Risk Summary (To be displayed on public campaign page)
              </h3>
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
                {complianceResult.investorRiskSummary?.map((risk: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-amber-900">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-slate-100 p-3 text-xs text-slate-500">
              📌 <strong>Notice:</strong> AI screening is a first pass. Platform operational and KYC review is maintained prior to real fund disbursements.
            </div>

            {publishError && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {publishError}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setStep(2)}>
                ← Back to Edit Draft
              </Button>
              <Button
                onClick={handlePublish}
                disabled={isPublishing || (!complianceResult.passed && complianceResult.flags.length > 0)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {isPublishing ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Publishing to Live Supabase...
                  </span>
                ) : (
                  'Publish Campaign to CafeStake 🚀'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
