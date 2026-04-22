import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json() as { reason?: string; message?: string }
    const { reason, message } = body
    if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    await supabase.from('feedback').insert({
      user_id: user.id,
      reason: reason ?? 'other',
      message: message.trim(),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
