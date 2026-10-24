import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { formatINRFull } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const { campaignId, amount } = await req.json()

    if (!campaignId || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: 'Valid campaign ID and investment amount are required' },
        { status: 400 }
      )
    }

    const admin = getSupabaseAdmin()
    const serverClient = await createSupabaseServerClient()

    // 1. Identify current user (fallback to demo investor if guest)
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    let investorId = user?.id
    let investorEmail = user?.email || 'A passionate local supporter'

    if (!investorId) {
      // Find the demo investor
      const { data: { users } } = await admin.auth.admin.listUsers()
      const demoInvestor = users.find((u) => u.email === 'demo.investor@cafestake.io')
      if (demoInvestor) {
        investorId = demoInvestor.id
        investorEmail = 'demo.investor@cafestake.io'
      } else if (users.length > 0) {
        investorId = users[0].id
      } else {
        return NextResponse.json({ error: 'Please log in to invest' }, { status: 401 })
      }
    }

    // 2. Fetch campaign details
    const { data: campaign, error: campaignError } = await admin
      .from('campaigns')
      .select('id, title, owner_id, raised, goal, min_ticket')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const investAmount = Number(amount)
    const newRaised = Number(campaign.raised || 0) + investAmount

    // 3. Insert investment record
    const { data: investment, error: investError } = await admin
      .from('investments')
      .insert({
        campaign_id: campaign.id,
        investor_id: investorId,
        amount: investAmount,
        status: 'completed',
      })
      .select()
      .single()

    if (investError) {
      console.error('Error inserting investment:', investError)
      return NextResponse.json({ error: 'Failed to record investment' }, { status: 500 })
    }

    // 4. Update campaign raised amount
    const { error: updateError } = await admin
      .from('campaigns')
      .update({
        raised: newRaised,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaign.id)

    if (updateError) {
      console.error('Error updating campaign raised:', updateError)
    }

    // 5. Insert notification for the business owner
    const formattedAmount = formatINRFull(investAmount)
    const notificationMessage = `${investorEmail} invested ${formattedAmount} in "${campaign.title}"!`

    const { error: notifError } = await admin
      .from('notifications')
      .insert({
        user_id: campaign.owner_id,
        message: notificationMessage,
        read: false,
      })

    if (notifError) {
      console.error('Error sending owner notification:', notifError)
    }

    return NextResponse.json({
      success: true,
      investment,
      newRaised,
      notificationMessage,
    })
  } catch (error: any) {
    console.error('Invest API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process investment' },
      { status: 500 }
    )
  }
}
