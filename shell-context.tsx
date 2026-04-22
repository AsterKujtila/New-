'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import type { Tab } from '@/lib/types'

interface ShellContextType {
  activeTab:    Tab
  setActiveTab: (tab: Tab) => void
  settingsOpen: boolean
  openSettings: () => void
  closeSettings:() => void
}

const ShellContext = createContext<ShellContextType | null>(null)

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [activeTab,    setActiveTab]    = useState<Tab>('chat')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const openSettings   = useCallback(() => setSettingsOpen(true),  [])
  const closeSettings  = useCallback(() => setSettingsOpen(false), [])
  return (
    <ShellContext.Provider value={{ activeTab, setActiveTab, settingsOpen, openSettings, closeSettings }}>
      {children}
    </ShellContext.Provider>
  )
}

export function useShell() {
  const ctx = useContext(ShellContext)
  if (!ctx) throw new Error('useShell must be used inside ShellProvider')
  return ctx
}
