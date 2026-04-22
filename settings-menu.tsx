'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Settings, UserCircle, Info, MessageSquare, Share2, LogOut,
  ArrowLeft, ChevronRight, type LucideIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const MENU_MS  = 350
const PANEL_MS = 280
const EASING   = 'cubic-bezier(0.32, 0.72, 0, 1)'
const DELETE_PHRASE = 'delete my account'

interface SettingsMenuProps {
  isOpen:   boolean
  onClose:  () => void
  onLogout: () => void
}

const MENU_ICON: Record<string, LucideIcon> = {
  Preferences:   Settings,
  Account:       UserCircle,
  About:         Info,
  Feedback:      MessageSquare,
  'Share SELLR': Share2,
  Logout:        LogOut,
}

const MENU_GROUPS: { label: string }[][] = [
  [{ label: 'Preferences' }, { label: 'Account' }, { label: 'About' }, { label: 'Feedback' }],
  [{ label: 'Share SELLR' }],
  [{ label: 'Logout' }],
]

const IN_SHEET = new Set(['Preferences', 'Account', 'About', 'Feedback', 'Share SELLR'])

export function SettingsMenu({ isOpen, onClose, onLogout }: SettingsMenuProps) {
  const [visible,    setVisible]    = useState(false)
  const [sheetY,     setSheetY]     = useState(0)
  const [animating,  setAnimating]  = useState(false)
  const [panelStack, setPanelStack] = useState<string[]>([])
  const [panelDir,   setPanelDir]   = useState<'in' | 'out'>('in')

  const isDragging = useRef(false)
  const startY     = useRef(0)
  const lastY      = useRef(0)
  const velocity   = useRef(0)
  const lastTime   = useRef(0)

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
      setSheetY(window.innerHeight)
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setAnimating(true)
        setSheetY(0)
      }))
    } else if (visible) {
      setAnimating(true)
      setSheetY(window.innerHeight)
      const t = setTimeout(() => { setVisible(false); setAnimating(false) }, MENU_MS)
      return () => clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (!isOpen && visible) setPanelStack([])
  }, [isOpen, visible])

  useEffect(() => {
    document.body.style.overflow = visible ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [visible])

  const openPanel  = useCallback((label: string) => { setPanelDir('in');  setPanelStack(s => [...s, label]) }, [])
  const closePanel = useCallback(() => {
    setPanelDir('out')
    setTimeout(() => setPanelStack(s => s.slice(0, -1)), PANEL_MS)
  }, [])

  const handleItem = useCallback((label: string) => {
    if (label === 'Logout') { onClose(); setTimeout(onLogout, 100); return }
    if (IN_SHEET.has(label)) { openPanel(label); return }
  }, [openPanel, onClose, onLogout])

  const dragStart = useCallback((clientY: number) => {
    isDragging.current = true
    startY.current = clientY
    lastY.current  = clientY
    lastTime.current = Date.now()
    velocity.current = 0
    setAnimating(false)
  }, [])

  const dragMove = useCallback((clientY: number) => {
    if (!isDragging.current) return
    const diff = clientY - startY.current
    const dt   = Date.now() - lastTime.current
    if (dt > 0) velocity.current = (clientY - lastY.current) / dt
    lastY.current    = clientY
    lastTime.current = Date.now()
    if (diff > 0) setSheetY(diff)
  }, [])

  const dragEnd = useCallback(() => {
    isDragging.current = false
    if (sheetY > 120 || velocity.current > 0.5) {
      setAnimating(true)
      setSheetY(window.innerHeight)
      setTimeout(onClose, MENU_MS - 50)
    } else {
      setAnimating(true)
      setSheetY(0)
    }
  }, [sheetY, onClose])

  if (!visible) return null

  const activePanel = panelStack[panelStack.length - 1] ?? null
  const showList    = panelStack.length === 0

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        style={{ opacity: isOpen && sheetY < 100 ? 1 : 0, transition: `opacity ${MENU_MS}ms ${EASING}` }}
        onClick={onClose}
      />

      <div
        className="absolute inset-x-0 bottom-0 top-8 bg-background rounded-t-3xl flex flex-col touch-none"
        style={{
          transform:  `translateY(${sheetY}px)`,
          transition: animating ? `transform ${MENU_MS}ms ${EASING}` : 'none',
          willChange: 'transform',
        }}
        onTouchStart={e => dragStart(e.touches[0].clientY)}
        onTouchMove={e  => dragMove(e.touches[0].clientY)}
        onTouchEnd={dragEnd}
        onPointerDown={e => {
          if (e.pointerType !== 'touch') {
            dragStart(e.clientY)
            ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
          }
        }}
        onPointerMove={e => { if (e.pointerType !== 'touch') dragMove(e.clientY) }}
        onPointerUp={e   => { if (e.pointerType !== 'touch') dragEnd() }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-6 cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1 rounded-full bg-foreground/40" />
        </div>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 flex min-h-0 relative">

            {/* Menu list */}
            <div
              className="absolute inset-0 overflow-y-auto px-5 pb-10 no-scrollbar"
              style={{
                opacity:    showList ? 1 : 0,
                transform:  `translateX(${showList ? 0 : panelDir === 'in' ? -12 : 12}px)`,
                transition: `opacity ${PANEL_MS}ms ${EASING}, transform ${PANEL_MS}ms ${EASING}`,
                visibility: showList ? 'visible' : 'hidden',
              }}
            >
              <UserHeader />
              {MENU_GROUPS.map((group, gi) => (
                <div key={gi} className="glass rounded-2xl mb-4 overflow-hidden">
                  {group.map(item => {
                    const Icon = MENU_ICON[item.label]
                    const isDestructive = item.label === 'Logout'
                    return (
                      <button
                        key={item.label}
                        onClick={() => handleItem(item.label)}
                        className={cn(
                          'w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors text-left',
                          isDestructive ? 'text-destructive' : 'text-foreground/90'
                        )}
                      >
                        {Icon && <Icon className="w-5 h-5 shrink-0 opacity-60" strokeWidth={1.5} />}
                        <span className="flex-1 text-sm font-sans">{item.label}</span>
                        {!isDestructive && <ChevronRight className="w-4 h-4 text-foreground/40 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Sub-panel */}
            <div
              className="absolute inset-0 flex flex-col"
              style={{
                opacity:    activePanel ? 1 : 0,
                transform:  `translateX(${activePanel ? 0 : panelDir === 'out' ? 12 : -12}px)`,
                transition: `opacity ${PANEL_MS}ms ${EASING}, transform ${PANEL_MS}ms ${EASING}`,
                visibility: activePanel ? 'visible' : 'hidden',
              }}
            >
              <div className="px-5 pb-2 flex items-center gap-3 shrink-0">
                <button
                  onClick={closePanel}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>
                <h2 className="text-lg font-sans font-semibold text-foreground">{activePanel}</h2>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-10 no-scrollbar">
                {activePanel === 'Preferences'     && <PreferencesPanel />}
                {activePanel === 'Account'         && <AccountPanel onManage={() => openPanel('Manage Account')} />}
                {activePanel === 'Manage Account'  && <ManageAccountPanel onClose={closePanel} />}
                {activePanel === 'About'           && <AboutPanel />}
                {activePanel === 'Feedback'        && <FeedbackPanel />}
                {activePanel === 'Share SELLR'     && <SharePanel />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function UserHeader() {
  const [name,   setName]   = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [plan,   setPlan]   = useState('free')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setName(
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name    as string | undefined) ??
        user.email?.split('@')[0] ?? 'Seller'
      )
      setAvatar((user.user_metadata?.avatar_url as string | undefined) ?? null)
      supabase.from('profiles').select('plan').eq('id', user.id).single()
        .then(({ data }) => { if (data?.plan) setPlan(data.plan as string) })
    })
  }, [])

  return (
    <div className="glass rounded-2xl p-4 mb-4 flex items-center gap-3">
      {avatar ? (
        <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
          {name[0]?.toUpperCase() ?? 'S'}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-sans font-medium text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground capitalize">{plan} plan</p>
      </div>
    </div>
  )
}

function PreferencesPanel() {
  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-sans font-medium text-foreground">Dark mode</p>
            <p className="text-xs text-muted-foreground mt-0.5">Always on for best experience</p>
          </div>
          <Switch checked disabled />
        </div>
      </div>
      <div className="glass rounded-2xl p-5">
        <p className="text-sm font-sans font-medium text-foreground mb-1">Voice input</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Tap the mic button in Chat to speak your questions. Works on iOS Safari and Android Chrome.
        </p>
      </div>
    </div>
  )
}

function AccountPanel({ onManage }: { onManage: () => void }) {
  return (
    <div className="space-y-4">
      <button
        onClick={onManage}
        className="w-full glass rounded-2xl px-5 py-4 flex items-center gap-4 text-foreground/90 hover:bg-white/5 transition-colors text-left"
      >
        <UserCircle className="w-5 h-5 text-foreground/60 shrink-0" strokeWidth={1.5} />
        <span className="flex-1 text-sm font-sans">Manage Account</span>
        <ChevronRight className="w-4 h-4 text-foreground/40 shrink-0" />
      </button>
    </div>
  )
}

function ManageAccountPanel({ onClose }: { onClose: () => void }) {
  const supabase = createClient()
  const [profileName,  setProfileName]  = useState('')
  const [whopUrl,      setWhopUrl]      = useState('')
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [showDelete,   setShowDelete]   = useState(false)
  const [deleteText,   setDeleteText]   = useState('')
  const [deleteLoading,setDeleteLoading]= useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('name, whop_store_url').eq('id', user.id).single()
        .then(({ data }) => {
          if (data) {
            setProfileName((data.name as string | null) ?? '')
            setWhopUrl((data.whop_store_url as string | null) ?? '')
          }
        })
    })
  }, [supabase])

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setSaving(true)
    await supabase.from('profiles').update({
      name: profileName.trim(),
      whop_store_url: whopUrl.trim(),
    }).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDelete = async () => {
    if (deleteText.trim().toLowerCase() !== DELETE_PHRASE) return
    setDeleteLoading(true)
    const res = await fetch('/api/account/delete', { method: 'DELETE' })
    setDeleteLoading(false)
    if (res.ok) {
      await supabase.auth.signOut()
      onClose()
      window.location.href = '/login'
    }
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-5 space-y-4">
        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">Your name</Label>
          <Input value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Your name" />
        </div>
        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">Whop store URL</Label>
          <Input value={whopUrl} onChange={e => setWhopUrl(e.target.value)} placeholder="whop.com/your-store" />
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg" className="w-full">
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
        </Button>
      </div>

      <div className="glass rounded-2xl p-5">
        <p className="text-sm font-sans font-medium text-foreground mb-3">Danger zone</p>
        <Button variant="outline" size="lg" className="w-full border-destructive/40 text-destructive hover:bg-destructive/10" onClick={() => setShowDelete(true)}>
          Delete account
        </Button>
      </div>

      {showDelete && (
        <div className="glass rounded-2xl p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            Type <strong className="text-foreground">&quot;{DELETE_PHRASE}&quot;</strong> to confirm. Cannot be undone.
          </p>
          <Input value={deleteText} onChange={e => setDeleteText(e.target.value)} placeholder={DELETE_PHRASE} />
          <Button variant="destructive" size="lg" className="w-full" disabled={deleteText.trim().toLowerCase() !== DELETE_PHRASE || deleteLoading} onClick={handleDelete}>
            {deleteLoading ? 'Deleting…' : 'Delete my account'}
          </Button>
          <button onClick={() => setShowDelete(false)} className="w-full text-sm text-muted-foreground text-center">Cancel</button>
        </div>
      )}
    </div>
  )
}

function AboutPanel() {
  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-5 space-y-3">
        <p className="text-sm text-foreground/80 leading-relaxed">
          SELLR is an AI sales coach built exclusively for Whop sellers and digital product creators.
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Ask about pricing, copy, conversions, launch strategy, and growing your Whop community. Direct, specific, actionable — no fluff.
        </p>
        <p className="text-sm text-foreground/80">
          Built by{' '}
          <a href="https://whop.com" target="_blank" rel="noreferrer" className="underline font-semibold text-primary">PROSPR</a>
          {' '}· Powered by Claude AI.
        </p>
      </div>
    </div>
  )
}

const FEEDBACK_REASONS = [
  { value: 'bug',        label: 'Bug or technical issue' },
  { value: 'suggestion', label: 'Suggestion or idea' },
  { value: 'other',      label: 'Other' },
] as const

function FeedbackPanel() {
  const [reason,     setReason]     = useState('suggestion')
  const [message,    setMessage]    = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)

  const handleSubmit = async () => {
    const text = message.trim()
    if (!text) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, message: text }),
      })
      if (res.ok) { setSubmitted(true); setMessage('') }
    } finally { setSubmitting(false) }
  }

  if (submitted) {
    return <div className="glass rounded-2xl p-5"><p className="text-sm text-foreground">Thanks! We&apos;ve received your feedback.</p></div>
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-5 space-y-4">
        <p className="text-xs text-muted-foreground">We read every message and act on it.</p>
        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">Reason</Label>
          <RadioGroup value={reason} onValueChange={setReason} className="flex flex-col gap-2">
            {FEEDBACK_REASONS.map(r => (
              <div key={r.value} className="flex items-center gap-3">
                <RadioGroupItem value={r.value} id={`fb-${r.value}`} />
                <Label htmlFor={`fb-${r.value}`} className="cursor-pointer text-foreground/90">{r.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">Your feedback</Label>
          <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your feedback…" rows={4} className="min-h-[100px]" />
        </div>
        <Button size="lg" className="w-full" disabled={!message.trim() || submitting} onClick={handleSubmit}>
          {submitting ? 'Sending…' : 'Submit feedback'}
        </Button>
      </div>
    </div>
  )
}

function SharePanel() {
  const [sharing, setSharing] = useState(false)
  const [copied,  setCopied]  = useState(false)

  const handleShare = async () => {
    if (sharing) return
    setSharing(true); setCopied(false)
    try {
      const url = typeof window !== 'undefined' ? window.location.origin : 'https://sellr.ai'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof navigator !== 'undefined' && (navigator as any).share) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (navigator as any).share({ title: 'SELLR.ai', text: 'AI sales coach for Whop sellers.', url })
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url); setCopied(true)
      }
    } catch { /* ignore */ }
    setSharing(false)
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-5 space-y-3">
        <p className="text-sm text-foreground/80">Share SELLR with other Whop sellers.</p>
        <Button size="lg" className="w-full" onClick={handleShare} disabled={sharing}>
          {sharing ? 'Sharing…' : copied ? '✓ Link copied' : 'Share SELLR'}
        </Button>
      </div>
    </div>
  )
}
