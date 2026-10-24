'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { createClient } from '@/lib/supabase'
import { DemoLogin } from '@/components/DemoLogin'
import { Menu, X, ChevronDown, LayoutDashboard, PlusCircle, Briefcase } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function Header() {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const nav = [
    { href: '/', label: 'Home' },
    { href: '/campaigns', label: 'Campaigns' },
    ...(user?.role === 'owner'
      ? [
          { href: '/dashboard', label: 'Owner Dashboard', icon: LayoutDashboard },
          { href: '/create-campaign', label: 'Create Campaign', icon: PlusCircle },
        ]
      : user?.role === 'investor'
      ? [{ href: '/portfolio', label: 'My Portfolio', icon: Briefcase }]
      : []),
  ]

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cafestake_demo_user')
      document.cookie = 'cafestake_demo_user=; path=/; max-age=0'
    }
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-[13px] h-px bg-primary" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
          ) : user ? (
            <div className="relative hidden md:block">
              <Button
                variant="ghost"
                className="gap-2"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-xs font-medium leading-none">{user.email?.split('@')[0]}</span>
                  <span className="mt-0.5 text-[10px] capitalize leading-none text-muted-foreground">
                    {user.role === 'owner' ? 'Business Owner' : 'Investor'}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-card p-1 shadow-xl">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {user.role === 'owner' ? 'Business Owner' : 'Investor'}
                      </p>
                    </div>
                    <div className="my-1 h-px bg-border" />
                    {user.role === 'owner' ? (
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          Owner Dashboard
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/portfolio" onClick={() => setUserMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-2">
                          <Briefcase className="h-4 w-4" />
                          My Portfolio
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-muted-foreground"
                      onClick={handleSignOut}
                    >
                      Sign out
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <DemoLogin />
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-amber-500 text-amber-950 hover:bg-amber-500/90">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border lg:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-3 sm:px-6">
            {nav.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              )
            })}
            {!user && (
              <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                <DemoLogin />
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-amber-500 text-amber-950 hover:bg-amber-500/90">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
