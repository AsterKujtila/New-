import { cn } from '@/lib/utils'

interface DesktopShellProps {
  children:  React.ReactNode
  gradient?: boolean
}

export function DesktopShell({ children, gradient = false }: DesktopShellProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-background md:items-center md:justify-center">
      <div className={cn(
        'relative w-full h-dvh flex flex-col overflow-hidden',
        gradient && 'sellr-gradient',
        'md:h-[min(800px,100dvh)] md:max-w-[430px] md:rounded-[32px]',
        'md:border md:border-white/10 md:shadow-[0_24px_80px_rgba(0,0,0,0.7)]'
      )}>
        {children}
      </div>
    </div>
  )
}
