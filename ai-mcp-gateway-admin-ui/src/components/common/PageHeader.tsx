import * as React from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: React.ReactNode
  badge?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

/**
 * Sticky page header with gradient text, optional icon, and an actions slot.
 * Used at the top of every page below the sidebar.
 */
export function PageHeader({
  title,
  description,
  icon,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        'pb-6 border-b border-border/60',
        className
      )}
    >
      <div className="flex items-start gap-4 min-w-0">
        {icon && (
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
              'bg-gradient-to-br from-primary/15 via-primary/5 to-transparent',
              'text-primary ring-1 ring-primary/20 shadow-soft-sm',
              'transition-transform duration-300 hover:scale-105'
            )}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>}
    </div>
  )
}
