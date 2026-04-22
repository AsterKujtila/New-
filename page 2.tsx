'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginContent() {
  const router  = useRouter()
  const params  = useSearchParams()
  const [pressing, setPressing] = useState(false)
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) { router.replace('/chat'); router.refresh() }
    })
    return () => subscription.unsubscribe()
  }, [router])

  const handleGoogleSignIn = () => {
    setLoading(true)
    window.location.href = '/api/auth/google'
  }

  const errMsg = params.get('error') === 'auth'
    ? (params.get('message') ? decodeURIComponent(params.get('message')!) : 'Sign in failed. Please try again.')
    : null

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <div className="absolute inset-0 onboarding-gradient noise-overlay" />
      <div className="relative z-10 min-h-dvh flex flex-col">

        {/* Logo */}
        <div className="flex justify-center pt-16 pb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <span className="font-serif font-black text-white" style={{ fontSize: 28, letterSpacing: '-0.02em' }}>S</span>
          </div>
        </div>

        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <h1 className="text-5xl font-serif text-foreground text-center leading-tight mb-3" style={{ fontWeight: 300, letterSpacing: '-0.03em' }}>
            Your Whop store,<br /><em>amplified.</em>
          </h1>
          <p className="text-sm font-sans text-foreground/70 text-center mt-2 max-w-xs leading-relaxed">
            AI sales coaching built exclusively for Whop sellers. Real advice, no fluff.
          </p>

          {errMsg && (
            <p className="mt-5 text-sm font-sans text-red-300 text-center max-w-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(196,64,64,0.15)', border: '1px solid rgba(196,64,64,0.3)' }}>
              {errMsg}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="px-8 pb-12 flex flex-col gap-4">
          <div className="flex justify-center gap-2 flex-wrap mb-2">
            {['Sales Copy', 'Pricing', 'Conversions', 'Launch Plans'].map(f => (
              <span key={f} className="text-[10px] font-sans font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.7)' }}>{f}</span>
            ))}
          </div>

          <button
            onClick={handleGoogleSignIn}
            onPointerDown={() => setPressing(true)}
            onPointerUp={() => setPressing(false)}
            onPointerLeave={() => setPressing(false)}
            disabled={loading}
            className="btn-continue w-full py-4 rounded-full font-sans font-semibold text-base flex items-center justify-center gap-3"
            style={{ background: pressing ? '#e8e0d8' : '#ffffff', color: '#1a1412', opacity: loading ? 0.75 : 1 }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 rounded-full" style={{ borderColor: 'rgba(196,114,74,0.3)', borderTopColor: '#c4724a', animation: 'spin .7s linear infinite' }} />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {loading ? 'Connecting…' : 'Continue with Google'}
          </button>

          <p className="text-xs font-sans text-foreground/50 text-center leading-relaxed">
            By continuing you agree to our <span className="underline font-semibold text-foreground/70">Terms of Service</span>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh relative overflow-hidden">
        <div className="absolute inset-0 onboarding-gradient" />
        <div className="relative z-10 min-h-dvh flex items-center justify-center">
          <div className="w-7 h-7 border-2 rounded-full" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff', animation: 'spin .7s linear infinite' }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
