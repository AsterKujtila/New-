'use client'

import { ArrowLeft } from 'lucide-react'
import { MenuIcon } from './menu-icon'
import { AppLogo } from './app-logo'

interface PageHeaderProps {
  title:     string
  onBack?:   () => void
  onMenu:    () => void
  showBack?: boolean
}

export function PageHeader({ title, onBack, onMenu, showBack = false }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
      {showBack ? (
        <button onClick={onBack} className="w-10 h-10 rounded-full glass flex items-center justify-center" aria-label="Go back">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      ) : (
        <div className="w-10 h-10 flex items-center justify-center">
          <AppLogo size={40} />
        </div>
      )}
      <h1 className="text-xs font-sans font-semibold tracking-[0.2em] text-foreground/90 uppercase">{title}</h1>
      <button onClick={onMenu} className="w-10 h-10 rounded-full glass flex items-center justify-center" aria-label="Open menu">
        <MenuIcon />
      </button>
    </header>
  )
}
