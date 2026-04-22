import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json() as {
      product?: string; audience?: string; outcome?: string; price?: string; style?: string
    }
    const { product, audience, outcome, price, style } = body
    if (!product) return NextResponse.json({ error: 'Product is required' }, { status: 400 })

    const prompt = `Write a complete high-converting Whop offer page.

Product: ${product}
Target audience: ${audience || 'not specified'}
Main outcome/transformation: ${outcome || 'not specified'}
Price point: ${price || 'not specified'}
Copy style: ${style || 'bold'}

Deliver exactly this structure:

**HEADLINE**
(Under 10 words. Outcome-focused.)

**SUBHEADLINE**
(1 sentence expanding the headline.)

**BULLET POINTS**
✓ [specific benefit with number or proof]
✓ [specific benefit with number or proof]
✓ [specific benefit with number or proof]
✓ [specific benefit with number or proof]
✓ [specific benefit with number or proof]

**CTA BUTTON TEXT**
(Under 6 words. Action verb + outcome.)

**TRUST LINE**
(One guarantee or social proof. Specific numbers win.)

---
**CRITIQUE**
Strongest element + the single best A/B test to run first.`

    const res = await claude.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = res.content[0]?.type === 'text' ? res.content[0].text.trim() : ''

    const { data: profile } = await supabase.from('profiles').select('credits_used').eq('id', user.id).single()
    supabase.from('profiles').update({ credits_used: (profile?.credits_used ?? 0) + 2 }).eq('id', user.id).then(() => {}).catch(() => {})

    return NextResponse.json({ text })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 })
  }
}
