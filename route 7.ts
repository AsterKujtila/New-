import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await supabase.from('profiles').delete().eq('id', user.id)
    await supabase.auth.signOut()

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
