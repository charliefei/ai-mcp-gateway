import * as React from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-16 text-center',
        'animate-in fade-in-0 slide-in-from-bottom-2',
        className
      )}
    >
      {icon && (
        <div className="relative mb-5">
          <div
            className={cn(
              'flex h-20 w-20 items-center justify-center rounded-2xl',
              'bg-gradient-to-br from-primary/15 via-primary/5 to-transparent',
              'text-primary ring-1 ring-primary/20'
            )}
          >
            {icon}
          </div>
          <div
            className="absolute inset-0 -z-10 blur-2xl opacity-30 bg-primary rounded-2xl"
            aria-hidden
          />
        </div>
      )}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-muted-foreground max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
