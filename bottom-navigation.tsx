'use client'

import { cn } from '@/lib/utils'
import { MessageCircle, PenLine, Store, Zap } from 'lucide-react'
import type { Tab } from '@/lib/types'

interface BottomNavigationProps {
  activeTab:   Tab
  onTabChange: (tab: Tab) => void
}

const TABS: { id: Tab; label: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }> }[] = [
  { id: 'chat',    label: 'Chat',    Icon: MessageCircle },
  { id: 'offers',  label: 'Offers',  Icon: PenLine },
  { id: 'store',   label: 'Store',   Icon: Store },
  { id: 'credits', label: 'Credits', Icon: Zap },
]

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe pointer-events-none">
      <div className="glass-strong mx-auto mb-4 flex items-center justify-around rounded-full px-4 py-3 max-w-xs min-h-[56px] pointer-events-auto">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-1 rounded-xl transition-colors duration-200',
                isActive ? 'text-foreground' : 'text-foreground/45'
              )}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={21}
                strokeWidth={isActive ? 2.25 : 1.75}
                className={cn('shrink-0', isActive && 'text-primary')}
              />
              <span className={cn(
                'text-[10px] font-sans leading-tight',
                isActive ? 'font-semibold text-primary' : 'font-medium text-foreground/45'
              )}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
