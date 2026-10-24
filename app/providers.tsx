'use client'

import { ThemeProvider } from 'next-themes'
import { QueryProvider } from '@/components/QueryProvider'
import { ToastProvider } from '@/components/ui/toast'
import { Suspense } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
