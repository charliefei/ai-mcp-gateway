import * as React from 'react'
import { cn } from '@/lib/utils'

interface ToolbarProps {
  title: string
  description?: string
  count?: number | string
  icon?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

/**
 * Card-style toolbar used at the top of every list page — title, count, actions.
 */
export function Toolbar({
  title,
  description,
  count,
  icon,
  actions,
  className,
}: ToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        'px-5 py-4 border-b border-border/60 bg-gradient-to-b from-muted/30 to-transparent',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg shrink-0',
              'bg-primary/10 text-primary ring-1 ring-primary/20'
            )}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight leading-none flex items-center gap-2">
            {title}
            {count !== undefined && (
              <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 min-w-[24px] tabular-nums">
                {count}
              </span>
            )}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>}
    </div>
  )
}
