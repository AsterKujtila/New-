import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json() as { url?: string; description?: string }
    const { url, description } = body
    if (!description) return NextResponse.json({ error: 'Store description is required' }, { status: 400 })

    const prompt = `Analyze this Whop store and give a brutally honest revenue diagnosis.

Store URL: ${url || 'not provided'}
Store description: ${description}

Structure your response exactly like this:

**OVERALL SCORE: [X]/100**
[One punchy verdict — what's the #1 thing holding this store back]

**TOP 3 REVENUE LEAKS**
For each:
→ Problem: [specific issue]
→ Impact: [estimated revenue drag]
→ Fix: [exact action, word-for-word if copy]
→ Recovery: [realistic uplift]

**QUICK WINS (do this week)**
Three specific actions under 2 hours each, with expected impact.

**OFFER REVIEW**
- Positioning clarity (1-10): [score + reason]
- Price/value match: [assessment]
- What buyers expect but is missing

**→ Your #1 priority today:**
[The single most important action. Be specific.]`

    const res = await claude.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = res.content[0]?.type === 'text' ? res.content[0].text.trim() : ''

    const { data: profile } = await supabase.from('profiles').select('credits_used').eq('id', user.id).single()
    supabase.from('profiles').update({ credits_used: (profile?.credits_used ?? 0) + 3 }).eq('id', user.id).then(() => {}).catch(() => {})

    return NextResponse.json({ text })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 })
  }
}
