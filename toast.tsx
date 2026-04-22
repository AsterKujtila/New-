'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'

interface ToastProps {
  message:   string
  type?:     'success' | 'error' | 'info'
  onDismiss: () => void
}

export function Toast({ message, type = 'info', onDismiss }: ToastProps) {
  React.useEffect(() => {
    const t = setTimeout(onDismiss, 3000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className={cn(
      'fixed bottom-24 left-1/2 -translate-x-1/2 z-[200]',
      'px-4 py-2.5 rounded-full text-sm font-sans font-medium glass-strong shadow-xl',
      type === 'success' && 'text-green-400',
      type === 'error'   && 'text-red-400',
      type === 'info'    && 'text-foreground'
    )}>
      {message}
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = React.useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null)
  const show    = (message: string, type: 'success' | 'error' | 'info' = 'info') => setToast({ message, type })
  const dismiss = () => setToast(null)
  return { toast, show, dismiss }
}
