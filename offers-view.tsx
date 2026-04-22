'use client'

import { useRef, useState } from 'react'
import { ArrowUp, Copy, Check } from 'lucide-react'
import { cn, parseMarkdown } from '@/lib/utils'
import { ThinkingDots } from '@/components/thinking-dots'

const STYLES = [
  { id: 'bold',    label: 'Bold',    desc: 'Direct & punchy' },
  { id: 'soft',    label: 'Soft',    desc: 'Warm & empathetic' },
  { id: 'urgency', label: 'Urgency', desc: 'FOMO-driven' },
  { id: 'story',   label: 'Story',   desc: 'Narrative arc' },
]

export default function OffersView() {
  const [style,   setStyle]   = useState('bold')
  const [result,  setResult]  = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState<string | null>(null)
  const [copied,  setCopied]  = useState(false)
  const [view,    setView]    = useState<'form' | 'result'>('form')

  const productRef  = useRef<HTMLInputElement>(null)
  const audienceRef = useRef<HTMLTextAreaElement>(null)
  const outcomeRef  = useRef<HTMLInputElement>(null)
  const priceRef    = useRef<HTMLInputElement>(null)

  const run = async () => {
    const product  = productRef.current?.value.trim() ?? ''
    const audience = audienceRef.current?.value.trim() ?? ''
    const outcome  = outcomeRef.current?.value.trim() ?? ''
    const price    = priceRef.current?.value.trim() ?? ''

    if (!product) { setErr('Product name is required.'); return }
    setErr(null); setLoading(true); setResult(null); setView('result')

    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, audience, outcome, price, style }),
      })
      const data = await res.json() as { text?: string; error?: string }
      if (!res.ok || data.error) throw new Error(data.error ?? `Error ${res.status}`)
      setResult(data.text ?? '')
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Something went wrong.')
      setView('form')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard?.writeText(result).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inp = 'w-full bg-transparent text-sm font-sans text-foreground placeholder:text-foreground/25 outline-none'

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-14 pb-4 shrink-0">
        <h1 className="text-2xl font-serif" style={{ fontWeight: 300, letterSpacing: '-0.02em' }}>Offer Builder</h1>
        <p className="text-xs text-foreground/40 mt-0.5">SELLR writes your complete offer copy.</p>
      </div>

      {view === 'form' ? (
        <div className="flex-1 overflow-y-auto touch-scroll no-scrollbar px-4 pb-28 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Product / Service <span className="text-primary">*</span></label>
            <div className="glass rounded-xl px-3 py-2.5">
              <input ref={productRef} type="text" placeholder="e.g. Fitness coaching community" className={inp} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Target Audience</label>
            <div className="glass rounded-xl px-3 py-2.5">
              <textarea ref={audienceRef} rows={2} placeholder="e.g. Online coaches making under $5k/month" className={cn(inp, 'resize-none leading-relaxed')} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Main Outcome</label>
            <div className="glass rounded-xl px-3 py-2.5">
              <input ref={outcomeRef} type="text" placeholder="e.g. Double revenue in 60 days" className={inp} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Price Point</label>
            <div className="glass rounded-xl px-3 py-2.5">
              <input ref={priceRef} type="text" placeholder="e.g. $47/mo or $197 one-time" className={inp} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Copy Style</label>
            <div className="grid grid-cols-4 gap-2">
              {STYLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={cn(
                    'flex flex-col items-center py-2.5 rounded-xl text-xs font-medium capitalize transition-all border',
                    style === s.id ? 'bg-primary/15 border-primary/40 text-primary' : 'glass border-transparent text-foreground/50 hover:text-foreground'
                  )}
                >
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {err && (
            <button onClick={() => setErr(null)} className="text-xs text-destructive/80 px-3 py-2 rounded-xl border border-destructive/20 bg-destructive/5 text-left">⚠️ {err}</button>
          )}

          <button onClick={run} className="w-full py-3.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 active:scale-[0.97] transition-all">
            <ArrowUp size={15} /> Generate Offer Copy
          </button>
          <p className="text-[10px] text-foreground/30 text-center">Uses 2 credits</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto touch-scroll no-scrollbar px-4 pb-28 flex flex-col gap-4">
          <div className="flex items-center justify-between shrink-0">
            <button onClick={() => { setView('form'); setResult(null) }} className="text-xs text-foreground/50 hover:text-foreground transition-colors">← New offer</button>
            {result && (
              <button onClick={handleCopy} className={cn('flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full glass transition-colors', copied ? 'text-green-400' : 'text-foreground/50 hover:text-foreground')}>
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? 'Copied' : 'Copy all'}
              </button>
            )}
          </div>

          {loading && (
            <div className="flex flex-col items-center gap-3 py-12">
              <ThinkingDots />
              <p className="text-xs text-foreground/40 italic">Writing your offer copy…</p>
            </div>
          )}

          {result && !loading && (
            <div className="glass rounded-2xl p-5 text-sm font-light text-foreground leading-relaxed prose-sellr" dangerouslySetInnerHTML={{ __html: parseMarkdown(result) }} />
          )}
        </div>
      )}
    </div>
  )
}
