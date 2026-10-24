'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { DemoLogin } from '@/components/DemoLogin'
import { createClient } from '@/lib/supabase'

export function Header() {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  const nav = [
    { href: '/', label: 'Home' },
    { href: '/campaigns', label: 'Campaigns' },
    ...(user?.role === 'owner'
      ? [
          { href: '/dashboard', label: 'Owner Dashboard' },
          { href: '/create-campaign', label: '+ Create Campaign' },
        ]
      : user?.role === 'investor'
      ? [{ href: '/portfolio', label: 'My Portfolio' }]
      : []),
  ]

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-40 border-b border-amber-100 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-sm transition group-hover:scale-105">
              <span className="text-lg font-black tracking-tight">☕</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Cafe<span className="text-amber-600">Stake</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {nav.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-amber-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded bg-slate-100" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end text-xs">
                <span className="font-medium text-slate-900">{user.email}</span>
                <span className="capitalize text-amber-700 font-semibold">
                  {user.role === 'owner' ? '👔 Business Owner' : '💰 Investor'}
                </span>
              </div>
              {user.role === 'owner' ? (
                <Link href="/create-campaign">
                  <Button size="sm" className="hidden lg:inline-flex bg-amber-600 hover:bg-amber-700 text-white">
                    + Raise Funds
                  </Button>
                </Link>
              ) : (
                <Link href="/campaigns">
                  <Button size="sm" className="hidden lg:inline-flex bg-amber-600 hover:bg-amber-700 text-white">
                    Invest Now
                  </Button>
                </Link>
              )}
              <Button size="sm" variant="outline" onClick={handleSignOut} className="text-slate-700 hover:bg-slate-100">
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <DemoLogin />
              <div className="hidden md:flex items-center gap-2 border-l border-slate-200 pl-2">
                <Link href="/login">
                  <Button size="sm" variant="ghost">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                    Sign up
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}