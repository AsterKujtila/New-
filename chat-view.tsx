'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowUp, Mic, MicOff, Copy, Volume2, RotateCcw } from 'lucide-react'
import { cn, getCurrentDateString, parseMarkdown } from '@/lib/utils'
import { ThinkingDots } from '@/components/thinking-dots'
import type { ChatMessage } from '@/lib/types'

// Extend Window for SpeechRecognition (not in all TS lib versions)
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition | undefined
    webkitSpeechRecognition: typeof SpeechRecognition | undefined
  }
}

const CHIPS = [
  "Why isn't my store converting?",
  'Write my offer headline',
  'How to price my community?',
  'Roast my sales page',
  'Create a 7-day launch plan',
  'What upsells should I add?',
  'How to grow on Whop?',
  'Analyze my checkout funnel',
]

const PLACEHOLDERS = [
  'You can start mid-sentence.',
  'Messy thoughts are welcome.',
  'Ask me anything about Whop.',
  "What's blocking your revenue?",
]

function uid() { return Math.random().toString(36).slice(2) }

interface ChatViewProps { name: string }

export default function ChatView({ name }: ChatViewProps) {
  const firstName = (name || 'there').split(' ')[0]

  const [msgs, setMsgs] = useState<ChatMessage[]>([{
    id: uid(),
    role: 'assistant',
    content: `Hey ${firstName} 👋 I'm SELLR — your AI sales coach built for Whop.\n\nAsk me anything about your store, pricing, offers, or copy. Specific, real advice — no fluff.\n\nWhat's the biggest problem with your Whop store right now?`,
  }])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState<string | null>(null)
  const [chips,   setChips]   = useState(true)
  const [micOn,   setMicOn]   = useState(false)
  const [hasMic,  setHasMic]  = useState(false)
  const [phIdx,   setPhIdx]   = useState(0)

  const bottomRef = useRef<HTMLDivElement>(null)
  const taRef     = useRef<HTMLTextAreaElement>(null)
  // Use a plain object ref instead of SpeechRecognition type to avoid strict TS issues
  const recRef    = useRef<{ start: () => void; stop: () => void } | null>(null)
  const ttsRef    = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    const t = setInterval(() => setPhIdx(p => (p + 1) % PLACEHOLDERS.length), 4500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!SR) return
    setHasMic(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = new SR() as any
    r.continuous = false
    r.lang = 'en-US'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => {
      const t = (e.results[0]?.[0]?.transcript ?? '') as string
      if (t) sendMsg(t)
    }
    r.onend  = () => setMicOn(false)
    r.onerror = () => setMicOn(false)
    recRef.current = r
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, loading])

  useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
  }, [input])

  const sendMsg = useCallback(async (override?: string) => {
    const text = (override ?? input).trim()
    if (!text || loading) return
    setInput('')
    setErr(null)
    setChips(false)
    if (taRef.current) taRef.current.style.height = 'auto'

    const userMsg: ChatMessage = { id: uid(), role: 'user', content: text }
    const next = [...msgs, userMsg]
    setMsgs(next)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json() as { text?: string; error?: string }
      if (!res.ok || data.error) throw new Error(data.error ?? `Error ${res.status}`)
      setMsgs(p => [...p, { id: uid(), role: 'assistant', content: data.text ?? '' }])
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }, [input, msgs, loading])

  const toggleMic = () => {
    if (!recRef.current) return
    if (micOn) { recRef.current.stop(); setMicOn(false) }
    else { try { recRef.current.start(); setMicOn(true) } catch { setMicOn(false) } }
  }

  const speak = (text: string, btn: HTMLButtonElement) => {
    if (!window.speechSynthesis) return
    if (ttsRef.current) {
      window.speechSynthesis.cancel()
      ttsRef.current = null
      btn.removeAttribute('data-tts')
      return
    }
    const u = new SpeechSynthesisUtterance(text.slice(0, 600))
    u.rate = 1.05
    const voices = window.speechSynthesis.getVoices()
    const v = voices.find(x => x.lang.startsWith('en'))
    if (v) u.voice = v
    u.onend = () => { ttsRef.current = null; btn.removeAttribute('data-tts') }
    u.onerror = () => { ttsRef.current = null; btn.removeAttribute('data-tts') }
    ttsRef.current = u
    btn.setAttribute('data-tts', '1')
    window.speechSynthesis.speak(u)
  }

  const copyText = (text: string, btn: HTMLButtonElement) => {
    navigator.clipboard?.writeText(text).catch(() => {})
    const orig = btn.innerHTML
    btn.innerHTML = '✓'
    setTimeout(() => { btn.innerHTML = orig }, 2000)
  }

  const reset = () => {
    setMsgs([{ id: uid(), role: 'assistant', content: '🔥 Fresh start. What do you want to work on?' }])
    setChips(true)
    setErr(null)
    setInput('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-3 shrink-0">
        <div>
          <p className="text-xs font-mono text-foreground/40 tracking-widest">{getCurrentDateString()}</p>
          <h1 className="text-2xl font-serif mt-0.5" style={{ fontWeight: 300, letterSpacing: '-0.02em' }}>
            Hey {firstName}
          </h1>
        </div>
        <button onClick={reset} className="p-2 rounded-full glass text-foreground/60 hover:text-foreground transition-colors" aria-label="New chat">
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Quick chips */}
      {chips && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 pb-3 shrink-0">
          {CHIPS.map(c => (
            <button
              key={c}
              onClick={() => { setChips(false); sendMsg(c) }}
              className="shrink-0 glass rounded-full px-3 py-1.5 text-xs font-sans text-foreground/70 hover:text-foreground transition-all whitespace-nowrap"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto touch-scroll no-scrollbar px-4 py-2 flex flex-col gap-3">
        {msgs.map((m, i) => (
          <div
            key={m.id}
            className={cn('flex flex-col gap-1.5', m.role === 'user' ? 'items-end' : 'items-start')}
            style={{ animation: 'msgIn .3s ease' }}
          >
            <div
              className={cn(
                'max-w-[88%] px-4 py-3 rounded-2xl text-sm font-sans font-light leading-relaxed',
                m.role === 'user' ? 'rounded-br-sm text-white' : 'glass rounded-bl-sm text-foreground'
              )}
              style={m.role === 'user' ? { background: 'rgba(196,114,74,0.85)' } : {}}
            >
              {m.role === 'user' ? (
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
              ) : (
                <div className="prose-sellr break-words" dangerouslySetInnerHTML={{ __html: parseMarkdown(m.content) }} />
              )}
            </div>

            {m.role === 'assistant' && i > 0 && (
              <div className="flex gap-1.5 ml-1">
                <button
                  onClick={e => copyText(m.content, e.currentTarget as HTMLButtonElement)}
                  className="w-7 h-7 rounded-full glass flex items-center justify-center text-foreground/50 hover:text-foreground transition-colors"
                  aria-label="Copy"
                >
                  <Copy size={11} />
                </button>
                <button
                  onClick={e => speak(m.content, e.currentTarget as HTMLButtonElement)}
                  className="w-7 h-7 rounded-full glass flex items-center justify-center text-foreground/50 hover:text-foreground transition-colors"
                  aria-label="Read aloud"
                >
                  <Volume2 size={11} />
                </button>
              </div>
            )}
          </div>
        ))}

        {loading && <div className="flex items-start"><ThinkingDots /></div>}

        {err && (
          <button
            onClick={() => setErr(null)}
            className="text-xs text-destructive/80 px-3 py-2 rounded-xl border border-destructive/20 bg-destructive/5 text-left"
          >
            ⚠️ {err} — tap to dismiss
          </button>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 pb-24 pt-2 shrink-0">
        <div
          className="flex items-end gap-2 px-4 py-3 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid var(--border)' }}
        >
          <textarea
            ref={taRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg() } }}
            placeholder={PLACEHOLDERS[phIdx]}
            rows={1}
            disabled={loading}
            className="flex-1 bg-transparent outline-none text-sm font-sans text-foreground placeholder:text-foreground/25 resize-none leading-relaxed"
            style={{ maxHeight: 160 }}
          />
          <div className="flex items-center gap-1.5 shrink-0">
            {hasMic && (
              <button
                onClick={toggleMic}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                  micOn ? 'bg-primary text-white' : 'glass text-foreground/50 hover:text-foreground'
                )}
                aria-label={micOn ? 'Stop recording' : 'Start recording'}
              >
                {micOn ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
            )}
            <button
              onClick={() => sendMsg()}
              disabled={!input.trim() || loading}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                input.trim() && !loading ? 'bg-primary text-white hover:bg-primary/90' : 'glass text-foreground/30'
              )}
              aria-label="Send"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 rounded-full border-foreground/20 border-t-foreground" style={{ animation: 'spin .7s linear infinite' }} />
              ) : (
                <ArrowUp size={15} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
