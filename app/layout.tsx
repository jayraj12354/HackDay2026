import type { Metadata } from 'next'
import './globals.css'
import { DemoBanner } from '@/components/DemoBanner'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ToastProvider } from '@/components/ui/toast'
import { QueryProvider } from '@/components/QueryProvider'

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
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <QueryProvider>
          <ToastProvider>
            <DemoBanner />
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  )
}