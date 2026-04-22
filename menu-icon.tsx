import { cn } from '@/lib/utils'

export function MenuIcon({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-[5px] w-5', className)}>
      <span className="block h-[1.5px] w-full bg-foreground rounded-full" />
      <span className="block h-[1.5px] w-3.5 bg-foreground rounded-full" />
      <span className="block h-[1.5px] w-full bg-foreground rounded-full" />
    </div>
  )
}
