import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatINR(amount: number): string {
  if (amount === 0) return '₹0'
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)} L`
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(2)}K`
  return `${sign}₹${abs}`
}

export function formatINRFull(amount: number): string {
  const abs = Math.floor(Math.abs(amount))
  const sign = amount < 0 ? '-' : ''
  const str = abs.toString()
  const lastThree = str.slice(-3)
  const rest = str.slice(0, -3)
  const restFormatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')
  const formatted = rest ? `${restFormatted},${lastThree}` : lastThree
  return `${sign}₹${formatted}`
}

export function formatPercent(pct: number): string {
  return `${pct}%`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}