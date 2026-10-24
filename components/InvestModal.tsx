'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatINR, formatINRFull } from '@/lib/utils'

interface InvestModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (amount: number) => void
  minTicket: number
  campaignTitle: string
  campaignId: string
}

export function InvestModal({
  open,
  onClose,
  onSuccess,
  minTicket,
  campaignTitle,
  campaignId,
}: InvestModalProps) {
  const [amount, setAmount] = useState(minTicket.toString())
  const [step, setStep] = useState<'amount' | 'payment' | 'processing'>('amount')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = parseInt(amount, 10)
    if (isNaN(numAmount) || numAmount < minTicket) {
      setError(`Minimum investment ticket is ${formatINRFull(minTicket)}`)
      return
    }
    setError(null)
    setStep('payment')
  }

  const handlePayment = async () => {
    setLoading(true)
    setError(null)
    setStep('processing')

    try {
      const investNum = parseInt(amount, 10)
      const res = await fetch('/api/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          amount: investNum,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete investment')
      }

      // Small simulated delay for realistic feel
      await new Promise((resolve) => setTimeout(resolve, 800))
      onSuccess(investNum)
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Payment processing failed')
      setStep('payment')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('amount')
    setAmount(minTicket.toString())
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invest in {campaignTitle}</DialogTitle>
          <DialogDescription>
            {step === 'amount' && 'Choose how much you would like to invest.'}
            {step === 'payment' && 'Review your simulated investment terms.'}
            {step === 'processing' && 'Simulating bank transfer and recording stake...'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {step === 'amount' && (
          <form onSubmit={handleAmountSubmit} className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="amount" className="font-semibold text-slate-800">
                Investment amount (₹)
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={minTicket}
                step={1000}
                className="text-lg font-bold"
                placeholder={minTicket.toString()}
              />
              <div className="flex justify-between text-xs text-slate-500 pt-1">
                <span>Min ticket: {formatINRFull(minTicket)}</span>
                <button
                  type="button"
                  onClick={() => setAmount((minTicket * 2).toString())}
                  className="text-amber-700 hover:underline font-medium"
                >
                  2x ({formatINRFull(minTicket * 2)})
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-3 text-xs text-amber-900 leading-relaxed">
              💡 You will receive monthly revenue share payouts directly to your linked account based on the business revenue.
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                Continue to Review
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'payment' && (
          <div className="space-y-4 py-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Business</span>
                <span className="font-semibold text-slate-900">{campaignTitle}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">Investment Amount</span>
                <span className="font-bold text-amber-700 text-base">
                  {formatINRFull(parseInt(amount, 10))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Instrument</span>
                <span className="font-medium text-slate-700">Revenue-Share Note</span>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900">
              <p className="font-semibold flex items-center gap-1.5">
                <span>🛡️</span> Demo Simulator
              </p>
              <p className="mt-1 text-blue-800">
                This simulated transaction will record real data in Supabase and notify the owner in realtime. No actual money is debited.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setStep('amount')} disabled={loading}>
                Back
              </Button>
              <Button
                onClick={handlePayment}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                Confirm & Invest {formatINR(parseInt(amount, 10))}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-8 text-center space-y-4">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
            <p className="font-medium text-slate-800">Securing your stake...</p>
            <p className="text-xs text-slate-500">Updating live records in Supabase Realtime</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
