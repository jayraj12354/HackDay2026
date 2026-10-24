import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json()
    const email = role === 'owner' ? 'demo.owner@cafestake.io' : 'demo.investor@cafestake.io'
    const password = 'Demo1234!'
    const userId = role === 'owner' ? 'demo-owner-id' : 'demo-investor-id'

    // If Supabase is not configured yet, return instant demo credentials
    if (!isSupabaseConfigured) {
      return NextResponse.json({
        success: true,
        email,
        password,
        role,
        mock: true,
        user: { id: userId, email, role },
      })
    }

    try {
      const admin = getSupabaseAdmin()

      // Check if user exists
      const { data: { users }, error: listError } = await admin.auth.admin.listUsers()
      if (listError) throw listError

      const existingUser = users.find((u: any) => u.email === email)

      if (!existingUser) {
        const { error: createError } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { role },
        })
        if (createError) throw createError
      } else {
        // Ensure password and role metadata match
        await admin.auth.admin.updateUserById(existingUser.id, {
          password,
          email_confirm: true,
          user_metadata: { ...existingUser.user_metadata, role },
        })
      }

      return NextResponse.json({ success: true, email, password, role })
    } catch (dbErr: any) {
      console.warn('Supabase admin connection failed, using demo fallback:', dbErr.message)
      return NextResponse.json({
        success: true,
        email,
        password,
        role,
        mock: true,
        user: { id: userId, email, role },
      })
    }
  } catch (error: any) {
    console.error('Demo login backend error:', error)
    return NextResponse.json(
      { error: error.message || 'Demo login failed' },
      { status: 500 }
    )
  }
}
