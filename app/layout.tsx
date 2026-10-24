import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DemoBanner } from '@/components/DemoBanner'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Providers } from './providers'
import { Suspense } from 'react'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'CafeStake — Invest in the places you love',
  description:
    'Local businesses raise growth funding from their own loyal customers. Invest in the cafes, bakeries and salons you love.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen bg-background font-sans antialiased`}>
        <Providers>
          <DemoBanner />
          <Suspense fallback={<div className="h-16 border-b border-border" />}>
            <Header />
          </Suspense>
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
