'use client'

import { useState } from 'react'
import { ArrowUp, Copy, Check } from 'lucide-react'
import { cn, parseMarkdown } from '@/lib/utils'
import { ThinkingDots } from '@/components/thinking-dots'

export default function StoreView() {
  const [url,     setUrl]     = useState('')
  const [desc,    setDesc]    = useState('')
  const [result,  setResult]  = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState<string | null>(null)
  const [copied,  setCopied]  = useState(false)
  const [ran,     setRan]     = useState(false)

  const run = async () => {
    if (!desc.trim()) { setErr('Please describe your store.'); return }
    setErr(null); setLoading(true); setResult(null); setRan(true)
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, description: desc }),
      })
      const data = await res.json() as { text?: string; error?: string }
      if (!res.ok || data.error) throw new Error(data.error ?? `Error ${res.status}`)
      setResult(data.text ?? '')
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Something went wrong.')
      setRan(false)
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
        <h1 className="text-2xl font-serif" style={{ fontWeight: 300, letterSpacing: '-0.02em' }}>Store Analyzer</h1>
        <p className="text-xs text-foreground/40 mt-0.5">Get an instant AI revenue diagnosis.</p>
      </div>

      <div className="flex-1 overflow-y-auto touch-scroll no-scrollbar px-4 pb-28 flex flex-col gap-4">
        {!ran ? (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Whop Store URL</label>
              <div className="glass rounded-xl px-3 py-2.5">
                <input value={url} onChange={e => setUrl(e.target.value)} type="text" placeholder="whop.com/your-store (optional)" className={inp} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Describe Your Store <span className="text-primary">*</span></label>
              <div className="glass rounded-xl px-3 py-2.5">
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={7} placeholder="What do you sell? Who's your audience? Current price? Conversion rate? Monthly revenue? What's not working?" className={cn(inp, 'resize-none leading-relaxed')} style={{ minHeight: 140 }} />
              </div>
              <p className="text-[10px] text-foreground/30 pl-1">More detail = better diagnosis. Include real numbers.</p>
            </div>

            {err && (
              <button onClick={() => setErr(null)} className="text-xs text-destructive/80 px-3 py-2 rounded-xl border border-destructive/20 bg-destructive/5 text-left">⚠️ {err}</button>
            )}

            <button onClick={run} className="w-full py-3.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 active:scale-[0.97] transition-all">
              <ArrowUp size={15} /> Analyze My Store
            </button>
            <p className="text-[10px] text-foreground/30 text-center">Uses 3 credits</p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between shrink-0">
              <button onClick={() => { setRan(false); setResult(null) }} className="text-xs text-foreground/50 hover:text-foreground transition-colors">← New analysis</button>
              {result && (
                <button onClick={handleCopy} className={cn('flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full glass transition-colors', copied ? 'text-green-400' : 'text-foreground/50 hover:text-foreground')}>
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                  {copied ? 'Copied' : 'Copy report'}
                </button>
              )}
            </div>

            {loading && (
              <div className="flex flex-col items-center gap-3 py-12">
                <ThinkingDots />
                <p className="text-xs text-foreground/40 italic">Diagnosing your store…</p>
              </div>
            )}

            {result && !loading && (
              <div className="glass rounded-2xl p-5 text-sm font-light text-foreground leading-relaxed prose-sellr" dangerouslySetInnerHTML={{ __html: parseMarkdown(result) }} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
