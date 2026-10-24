'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { DemoLogin } from '@/components/DemoLogin'

export function Header() {
  const { user } = useAuth()
  const pathname = usePathname()

  const nav = [
    { href: '/', label: 'Home' },
    { href: '/campaigns', label: 'Campaigns' },
    ...(user?.role === 'owner'
      ? [{ href: '/dashboard', label: 'Dashboard' }]
      : user?.role === 'investor'
      ? [{ href: '/portfolio', label: 'My Portfolio' }]
      : []),
  ]

  const handleSignOut = async () => {
    const { supabase } = await import('@/lib/supabase')
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-600 text-white">
            <span className="text-lg font-bold">C</span>
          </div>
          <span className="text-xl font-bold text-slate-900">
            Cafe<span className="text-amber-600">Stake</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition ${
                pathname === item.href
                  ? 'text-amber-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-slate-600 sm:inline">
                {user.email}
              </span>
              <Button size="sm" variant="outline" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <DemoLogin />
          )}
        </div>
      </div>
    </header>
  )
}