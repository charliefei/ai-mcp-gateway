import * as React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  icon: LucideIcon
  title: string
  display?: string
  description?: string
  meta?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  icon: Icon,
  title,
  display,
  description,
  meta,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'relative flex flex-col gap-5 pb-7 border-b border-border/40',
        'sm:flex-row sm:items-end sm:justify-between sm:gap-8',
        className
      )}
    >
      <div className="flex items-start gap-5">
        {/* Gradient icon tile */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary via-aurora-3 to-aurora-2 blur-md opacity-40" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-aurora-3 to-aurora-2 shadow-glow">
            <div className="absolute inset-0 rounded-2xl bg-glass-sheen" />
            <Icon className="relative h-6 w-6 text-white drop-shadow" strokeWidth={2} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {meta && (
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-block h-px w-6 bg-gradient-to-r from-primary to-transparent" />
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                {meta}
              </span>
            </div>
          )}
          <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight leading-[1.1] text-foreground">
            {title}
            {display && (
              <span className="ml-3 font-serif-display italic font-normal text-gradient">
                {display}
              </span>
            )}
          </h1>
          {description && (
            <p className="mt-2 text-[13.5px] text-muted-foreground max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </header>
  )
}
