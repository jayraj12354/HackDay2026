'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useQuery, useQueryClient } from '@tanstack/react-query'

/**
 * Custom hook for notifications management
 * Provides real-time notifications with Supabase Realtime subscription
 * @returns Object containing notifications, unread count, and mark functions
 */
export function useNotifications() {
  const qc = useQueryClient()
  const userId = useCurrentUserId()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)
      return data || []
    },
  })

  const unread = notifications.filter((n: any) => !n.read).length

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          qc.setQueryData(['notifications', userId], (old: any[] = []) => [
            payload.new,
            ...old,
          ])
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, qc])

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    qc.setQueryData(['notifications', userId], (old: any[] = []) =>
      old.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllRead = async () => {
    if (!userId) return
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
    qc.setQueryData(['notifications', userId], (old: any[] = []) =>
      old.map((n) => ({ ...n, read: true }))
    )
  }

  return { notifications, unread, markRead, markAllRead, isLoading }
}

/**
 * Helper hook to get current user ID
 * @returns Current user ID or null
 */
function useCurrentUserId(): string | null {
  const { data } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser()
      return data.user?.id || null
    },
  })
  return data || null
}