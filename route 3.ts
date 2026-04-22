import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const SYSTEM = `You are SELLR — an elite AI sales coach built exclusively for Whop sellers and digital product creators.

PERSONALITY: Direct, sharp, warm. Like a world-class sales consultant who genuinely cares. Roast bad ideas kindly, celebrate wins loudly, always give specific actionable fixes. Never generic — always specific to Whop.

EXPERTISE: Whop platform, offer copywriting, conversion optimization, pricing strategy, launch planning, community growth, TikTok/Instagram for Whop sellers, email sequences, store analysis.

RULES:
1. Be hyper-specific — name exact numbers, exact words, exact tactics
2. Keep responses scannable: short paragraphs, use → for key points
3. If someone shares copy or an offer, give a direct critique with exact rewrites
4. End EVERY response with "→ Next step:" + one clear specific action
5. Max 350 words unless asked for more
6. Use 🔥 for wins, 💡 for insights — max 2 per response
7. Never start with "Great question!" — just answer directly`

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as { messages?: { role: 'user' | 'assistant'; content: string }[] }
    const messages = body.messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    // Check credit limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_used, credits_limit, plan')
      .eq('id', user.id)
      .single()

    if (profile && profile.plan === 'free' && profile.credits_used >= profile.credits_limit) {
      return NextResponse.json(
        { error: 'Credit limit reached. Upgrade your plan to continue.' },
        { status: 429 }
      )
    }

    const res = await claude.messages.create({
      model:      'claude-opus-4-5',
      max_tokens: 1024,
      system:     SYSTEM,
      messages:   messages.map(m => ({
        role:    m.role,
        content: String(m.content).slice(0, 6000),
      })),
    })

    const text = res.content[0]?.type === 'text' ? res.content[0].text.trim() : ''

    // Increment credits in background
    if (profile) {
      supabase
        .from('profiles')
        .update({ credits_used: (profile.credits_used ?? 0) + 1 })
        .eq('id', user.id)
        .then(() => {})
        .catch(() => {})
    }

    return NextResponse.json({ text })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    console.error('[/api/chat]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
