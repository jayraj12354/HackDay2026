import { Logo } from '@/components/Logo'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Community-driven funding for local businesses. Empowering India's neighbourhood economy through transparent revenue-sharing.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Product</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/campaigns" className="transition-colors hover:text-foreground">
                  Campaigns
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="transition-colors hover:text-foreground">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-foreground">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="cursor-not-allowed">Terms of Service</span>
              </li>
              <li>
                <span className="cursor-not-allowed">Privacy Policy</span>
              </li>
              <li>
                <span className="cursor-not-allowed">Risk Disclosure</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© 2026 CafeStake. Demo project. All investments are simulated.</p>
        </div>
      </div>
    </footer>
  )
}
