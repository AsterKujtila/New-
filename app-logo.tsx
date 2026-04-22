import { cn } from '@/lib/utils'

interface AppLogoProps {
  className?: string
  size?: number
}

export function AppLogo({ className, size = 40 }: AppLogoProps) {
  return (
    <div
      className={cn('rounded-xl flex items-center justify-center shrink-0', className)}
      style={{
        width:      size,
        height:     size,
        background: 'rgba(196,114,74,0.18)',
        border:     '1px solid rgba(196,114,74,0.3)',
      }}
    >
      <span
        className="font-serif font-black text-primary"
        style={{ fontSize: size * 0.45, letterSpacing: '-0.02em' }}
      >
        S
      </span>
    </div>
  )
}
