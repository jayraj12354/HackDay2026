import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-white">
                <span className="text-sm font-bold">C</span>
              </div>
              <span className="text-lg font-bold text-slate-900">
                Cafe<span className="text-amber-600">Stake</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Community investing in local businesses.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Product</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link href="/campaigns" className="hover:text-amber-700">Campaigns</Link></li>
              <li><Link href="/portfolio" className="hover:text-amber-700">Portfolio</Link></li>
              <li><Link href="/dashboard" className="hover:text-amber-700">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Demo notice</h3>
            <p className="mt-3 text-sm text-slate-500">
              This is a demo project. No real money, no real KYC, no real
              payments. All investments are simulated.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}