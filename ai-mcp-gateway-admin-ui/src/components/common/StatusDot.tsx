import * as React from 'react'
import { cn } from '@/lib/utils'

interface StatusDotProps {
  status: 'online' | 'offline' | 'busy' | 'idle'
  label?: string
  className?: string
  showLabel?: boolean
}

const config = {
  online: { color: 'bg-emerald-500', glow: 'shadow-emerald-500/40', text: '在线' },
  offline: { color: 'bg-muted-foreground', glow: '', text: '离线' },
  busy: { color: 'bg-amber-500', glow: 'shadow-amber-500/40', text: '繁忙' },
  idle: { color: 'bg-sky-500', glow: 'shadow-sky-500/40', text: '空闲' },
} as const

export function StatusDot({ status, label, className, showLabel = true }: StatusDotProps) {
  const c = config[status]
  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-60',
            c.color,
            c.glow && `shadow-[0_0_8px_2px]`,
            status === 'online' && 'pulse-dot'
          )}
        />
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', c.color)} />
      </span>
      {showLabel && (
        <span className="text-xs text-muted-foreground">{label ?? c.text}</span>
      )}
    </div>
  )
}
