import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from '@/lib/supabase'

const PROTECTED_PREFIXES = ['/dashboard', '/portfolio', '/create-campaign']

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // If Supabase is not yet configured, allow traffic to pass through gracefully
  if (!isSupabaseConfigured) {
    return res
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({ name, value, ...options })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          req.cookies.set({ name, value: '', ...options })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({ name, value: '', ...options })
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { pathname } = req.nextUrl
    const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))

    if (isProtected && !user) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  } catch (err) {
    console.warn('Middleware auth error:', err)
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/portfolio/:path*', '/create-campaign/:path*'],
}
