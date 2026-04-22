'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LogOut, Zap } from 'lucide-react'

const PLANS = [
  { name: 'Starter', price: 19,  credits: 200,  hot: false,
    feats: ['Store Analyzer', 'Offer Builder', 'AI Chat', 'Credits never expire'] },
  { name: 'Pro',     price: 49,  credits: 600,  hot: true,
    feats: ['Everything in Starter', 'Priority responses', 'Unlimited chat history', 'Email support'] },
  { name: 'Scale',   price: 99,  credits: 1500, hot: false,
    feats: ['Everything in Pro', 'Founder access', '1:1 onboarding call', 'Custom integrations'] },
]

const CREDIT_COSTS = [
  { action: 'AI Chat message', cost: 1, icon: '💬' },
  { action: 'Offer Builder',   cost: 2, icon: '✍️' },
  { action: 'Store Analyzer',  cost: 3, icon: '🔍' },
]

interface CreditsViewProps { name: string; avatar?: string | null }

export default function CreditsView({ name, avatar }: CreditsViewProps) {
  const router = useRouter()
  const [used,    setUsed]    = useState(0)
  const [limit,   setLimit]   = useState(50)
  const [plan,    setPlan]    = useState('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles')
        .select('credits_used, credits_limit, plan')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setUsed(  (data.credits_used  as number | null) ?? 0)
            setLimit( (data.credits_limit as number | null) ?? 50)
            setPlan(  (data.plan          as string | null) ?? 'free')
          }
          setLoading(false)
        })
    })
  }, [])

  const logout = async () => {
    await createClient().auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  const pct       = Math.min((used / limit) * 100, 100)
  const remaining = Math.max(limit - used, 0)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 pt-14 pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-serif" style={{ fontWeight: 300, letterSpacing: '-0.02em' }}>Credits</h1>
          <p className="text-xs text-foreground/40 mt-0.5">Power your AI features.</p>
        </div>
        <button onClick={logout} className="w-9 h-9 rounded-full glass flex items-center justify-center text-foreground/50 hover:text-foreground transition-colors" aria-label="Sign out">
          <LogOut size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto touch-scroll no-scrollbar px-4 pb-28 flex flex-col gap-4">

        {/* Profile + balance */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            {avatar ? (
              <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                {name?.[0]?.toUpperCase() ?? 'S'}
              </div>
            )}
            <div>
              <p className="text-sm font-sans font-medium text-foreground">{name || 'Seller'}</p>
              <p className="text-xs text-muted-foreground capitalize">{plan} plan</p>
            </div>
          </div>

          <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2">Credits remaining</p>

          {loading ? (
            <div className="h-12 rounded-xl bg-white/5 animate-pulse" />
          ) : (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl font-serif font-black text-primary" style={{ letterSpacing: '-0.03em' }}>{remaining}</span>
                <span className="text-base text-foreground/40">/ {limit}</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: pct > 90 ? 'var(--destructive)' : 'var(--primary)' }}
                />
              </div>
              {remaining === 0 && (
                <p className="text-xs text-destructive mt-2">No credits remaining — upgrade to continue.</p>
              )}
            </>
          )}
        </div>

        {/* Credit costs */}
        <div className="glass rounded-2xl p-4">
          <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-3">Credit costs</p>
          <div className="flex flex-col gap-2">
            {CREDIT_COSTS.map(c => (
              <div key={c.action} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{c.icon}</span>
                  <span className="text-sm font-sans text-foreground/80">{c.action}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap size={11} className="text-primary" />
                  <span className="text-sm font-semibold text-primary">{c.cost}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plans */}
        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest px-1">Top up credits</p>

        {PLANS.map(p => (
          <div
            key={p.name}
            className={cn('rounded-2xl p-5 relative', p.hot ? 'border border-primary/30' : 'glass')}
            style={p.hot ? { background: 'rgba(196,114,74,0.1)' } : {}}
          >
            {p.hot && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-bold px-3 py-1 rounded-full tracking-wider">
                BEST VALUE
              </div>
            )}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className={cn('text-[10px] font-bold uppercase tracking-widest mb-1', p.hot ? 'text-primary/70' : 'text-foreground/40')}>{p.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className={cn('text-3xl font-serif font-black', p.hot ? 'text-primary' : 'text-foreground')} style={{ letterSpacing: '-0.03em' }}>${p.price}</span>
                  <span className="text-xs text-foreground/30">one-time</span>
                </div>
              </div>
              <div className={cn('flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold', p.hot ? 'bg-primary/20 text-primary' : 'glass text-foreground/60')}>
                <Zap size={11} />{p.credits.toLocaleString()}
              </div>
            </div>
            <ul className="space-y-1.5 mb-4">
              {p.feats.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-foreground/70">
                  <span className="text-primary shrink-0">✓</span>{f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => window.open('https://whop.com/sellr-ai', '_blank', 'noopener,noreferrer')}
              className={cn('w-full py-3 rounded-full text-sm font-semibold transition-all active:scale-[0.97]', p.hot ? 'bg-primary text-white hover:bg-primary/90' : 'glass text-foreground hover:bg-white/10')}
            >
              Get {p.credits.toLocaleString()} credits
            </button>
          </div>
        ))}

        <p className="text-[10px] text-foreground/30 text-center pb-2">Secure payment via Whop · Credits never expire</p>
      </div>
    </div>
  )
}
