import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
})

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json()

    const email = role === 'owner' ? 'demo.owner@cafestake.io' : 'demo.investor@cafestake.io'
    const password = 'Demo1234!'

    // Try to sign up (will fail if user exists, that's ok)
    await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
        emailRedirectTo: `${new URL(req.url).origin}/login`,
      },
    })

    // Return the credentials for the client to sign in
    return NextResponse.json({ success: true, email, password, role })
  } catch (error: any) {
    console.error('Demo login error:', error)
    return NextResponse.json(
      { error: error.message || 'Demo login failed' },
      { status: 500 }
    )
  }
}
