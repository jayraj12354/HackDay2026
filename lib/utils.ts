import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines class names using clsx and tailwind-merge
 * @param inputs - Class names to combine
 * @returns Merged class name string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as Indian Rupees with abbreviated units
 * @param amount - Amount in INR
 * @returns Formatted string (e.g., "₹10.5 L", "₹2.3 Cr")
 */
export function formatINR(amount: number): string {
  if (amount === 0) return '₹0'
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)} L`
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(2)}K`
  return `${sign}₹${abs}`
}

/**
 * Formats a number as Indian Rupees with full formatting (e.g., "₹10,00,000")
 * @param amount - Amount in INR
 * @returns Fully formatted string with Indian number system
 */
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

/**
 * Formats a number as a percentage
 * @param pct - Percentage value
 * @returns Formatted percentage string
 */
export function formatPercent(pct: number): string {
  return `${pct}%`
}

/**
 * Converts text to a URL-friendly slug
 * @param text - Text to slugify
 * @returns URL-friendly slug string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Truncates text to a specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}