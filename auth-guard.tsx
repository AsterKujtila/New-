'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const didCheck = useRef(false)

  useEffect(() => {
    if (didCheck.current) return
    didCheck.current = true

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace('/login'); return }

      // Ensure profile row exists
      supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()
        .then(({ data: profile }) => {
          if (!profile) {
            supabase.from('profiles').insert({
              id: user.id,
              name: (user.user_metadata?.full_name ?? user.user_metadata?.name ?? null) as string | null,
              email: user.email ?? null,
              avatar_url: (user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null) as string | null,
            }).then(() => {}).catch(() => {})
          }
        })
    })
  }, [router])

  return <>{children}</>
}
