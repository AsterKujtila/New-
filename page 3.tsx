'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { AuthGuard } from '@/components/auth-guard'
import { BottomNavigation } from '@/components/bottom-navigation'
import { SettingsMenu } from '@/components/settings-menu'
import { AppLogo } from '@/components/app-logo'
import { MenuIcon } from '@/components/menu-icon'
import { cn } from '@/lib/utils'
import type { Tab } from '@/lib/types'

// Lazy-load tab views for performance
const ChatView    = dynamic(() => import('@/components/chat-view'),    { ssr: false })
const OffersView  = dynamic(() => import('@/components/offers-view'),  { ssr: false })
const StoreView   = dynamic(() => import('@/components/store-view'),   { ssr: false })
const CreditsView = dynamic(() => import('@/components/credits-view'), { ssr: false })

const DESKTOP_BP = 1024

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia(`(min-width: ${DESKTOP_BP}px)`)
    setIsDesktop(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

function DesktopNotice({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onDismiss} />
      <div className="relative glass rounded-2xl p-6 max-w-sm w-full">
        <h2 className="text-lg font-sans font-semibold text-foreground mb-2">SELLR is mobile-first</h2>
        <p className="text-sm font-sans text-muted-foreground mb-4 leading-relaxed">
          SELLR is designed for mobile. On desktop you&apos;ll see a phone-frame preview. For the best experience, use SELLR on your phone.
        </p>
        <button onClick={onDismiss} className="w-full py-3 rounded-full bg-primary text-white font-sans font-semibold text-sm active:scale-[0.97] transition-all">
          Got it
        </button>
      </div>
    </div>
  )
}

export default function ChatShell() {
  const router  = useRouter()
  const [user, setUser]   = useState<{ name: string; avatar: string | null } | null>(null)
  const [tab,  setTab]    = useState<Tab>('chat')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [desktopNotice, setDesktopNotice] = useState(false)
  const isDesktop = useIsDesktop()
  const prevTab   = useRef<Tab>('chat')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) { router.replace('/login'); return }
      setUser({
        name:   u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Seller',
        avatar: u.user_metadata?.avatar_url || u.user_metadata?.picture || null,
      })
    })
  }, [router])

  useEffect(() => {
    if (isDesktop !== true) return
    try {
      const dismissed = window.localStorage.getItem('sellr_desktop_dismissed')
      if (dismissed !== 'true') setDesktopNotice(true)
    } catch { setDesktopNotice(true) }
  }, [isDesktop])

  const handleDismissDesktop = () => {
    setDesktopNotice(false)
    try { window.localStorage.setItem('sellr_desktop_dismissed', 'true') } catch { /* ignore */ }
  }

  const handleTabChange = (t: Tab) => {
    prevTab.current = tab
    setTab(t)
  }

  const handleLogout = async () => {
    const sb = createClient()
    await sb.auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  // Loading spinner
  if (!user) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div
          className="w-7 h-7 border-2 rounded-full"
          style={{
            borderColor:    'rgba(196,114,74,0.25)',
            borderTopColor: '#c4724a',
            animation:      'spin .7s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <AuthGuard>
      {/* Desktop notice */}
      {isDesktop && desktopNotice && <DesktopNotice onDismiss={handleDismissDesktop} />}

      {/* Desktop phone frame */}
      <div className="min-h-dvh flex flex-col bg-background md:items-center md:justify-center">
        <div
          className={cn(
            'relative w-full h-dvh flex flex-col overflow-hidden sellr-gradient',
            'md:h-[min(800px,100dvh)] md:max-w-[430px] md:rounded-[32px]',
            'md:border md:border-white/10 md:shadow-[0_24px_80px_rgba(0,0,0,0.7)]'
          )}
        >
          {/* Top header bar (shown on chat tab) */}
          {tab === 'chat' && (
            <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-12 pb-2 pointer-events-none">
              <div className="pointer-events-auto">
                <AppLogo size={36} />
              </div>
              <button
                onClick={() => setSettingsOpen(true)}
                className="pointer-events-auto w-10 h-10 rounded-full glass flex items-center justify-center"
                aria-label="Open menu"
              >
                <MenuIcon />
              </button>
            </header>
          )}

          {/* Tab views */}
          <main className="flex-1 overflow-hidden flex flex-col">
            {/* Header for non-chat tabs */}
            {tab !== 'chat' && (
              <header className="flex items-center justify-between px-5 pt-12 pb-0 shrink-0">
                <AppLogo size={36} />
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center"
                  aria-label="Open menu"
                >
                  <MenuIcon />
                </button>
              </header>
            )}

            <div key={tab} className="flex-1 overflow-hidden page-enter flex flex-col">
              {tab === 'chat'    && <ChatView    name={user.name} />}
              {tab === 'offers'  && <OffersView />}
              {tab === 'store'   && <StoreView />}
              {tab === 'credits' && <CreditsView name={user.name} avatar={user.avatar} />}
            </div>
          </main>

          {/* Bottom navigation */}
          <BottomNavigation activeTab={tab} onTabChange={handleTabChange} />

          {/* Settings menu */}
          <SettingsMenu
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            onLogout={handleLogout}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes dotb  { 0%,100%{transform:translateY(0) scale(1);opacity:.4} 50%{transform:translateY(-5px) scale(1.15);opacity:1} }
        @keyframes msgIn { from{opacity:0;transform:translateY(8px) scale(.97)} to{opacity:1;transform:none} }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }
      `}</style>
    </AuthGuard>
  )
}
