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
import { formatINR } from '@/lib/utils'

interface InvestModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  minTicket: number
  campaignTitle: string
}

export function InvestModal({
  open,
  onClose,
  onSuccess,
  minTicket,
  campaignTitle,
}: InvestModalProps) {
  const [amount, setAmount] = useState(minTicket.toString())
  const [step, setStep] = useState<'amount' | 'payment' | 'processing'>('amount')
  const [loading, setLoading] = useState(false)

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = parseInt(amount)
    if (numAmount >= minTicket) {
      setStep('payment')
    }
  }

  const handlePayment = async () => {
    setLoading(true)
    setStep('processing')
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
    onSuccess()
  }

  const handleClose = () => {
    setStep('amount')
    setAmount(minTicket.toString())
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invest in {campaignTitle}</DialogTitle>
          <DialogDescription>
            {step === 'amount' && 'Enter your investment amount'}
            {step === 'payment' && 'Confirm your investment'}
            {step === 'processing' && 'Processing your payment...'}
          </DialogDescription>
        </DialogHeader>

        {step === 'amount' && (
          <form onSubmit={handleAmountSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Investment amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={minTicket}
                step={1000}
                placeholder={minTicket.toString()}
              />
              <p className="text-xs text-muted-foreground">
                Minimum investment: {formatINR(minTicket)}
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">Continue to payment</Button>
            </DialogFooter>
          </form>
        )}

        {step === 'payment' && (
          <div className="space-y-4 py-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Campaign</span>
                <span className="font-medium">{campaignTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">{formatINR(parseInt(amount))}</span>
              </div>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
              <p className="font-medium">Demo payment</p>
              <p className="text-xs mt-1">
                This is a simulated payment. No real money will be charged.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep('amount')}>
                Back
              </Button>
              <Button onClick={handlePayment} disabled={loading}>
                Confirm investment
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Processing payment...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
