import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border bg-card text-card-foreground shadow-soft-sm transition-shadow duration-300',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'font-semibold leading-none tracking-tight text-lg',
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

// Glass card variant — for hero / dashboard
const CardGlass = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl glass shadow-soft-lg text-card-foreground',
        className
      )}
      {...props}
    />
  )
)
CardGlass.displayName = 'CardGlass'

// Stat card — for dashboard metrics
interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  delta?: string
  trend?: 'up' | 'down' | 'flat'
  icon?: React.ReactNode
  accent?: 'primary' | 'success' | 'warning' | 'info' | 'destructive'
}

const accentMap = {
  primary:
    'from-primary/15 via-primary/5 to-transparent text-primary [&_.stat-icon]:bg-primary/10 [&_.stat-icon]:text-primary',
  success:
    'from-emerald-500/15 via-emerald-500/5 to-transparent text-emerald-600 dark:text-emerald-400 [&_.stat-icon]:bg-emerald-500/10 [&_.stat-icon]:text-emerald-600 dark:[&_.stat-icon]:text-emerald-400',
  warning:
    'from-amber-500/15 via-amber-500/5 to-transparent text-amber-600 dark:text-amber-400 [&_.stat-icon]:bg-amber-500/10 [&_.stat-icon]:text-amber-600 dark:[&_.stat-icon]:text-amber-400',
  info: 'from-sky-500/15 via-sky-500/5 to-transparent text-sky-600 dark:text-sky-400 [&_.stat-icon]:bg-sky-500/10 [&_.stat-icon]:text-sky-600 dark:[&_.stat-icon]:text-sky-400',
  destructive:
    'from-rose-500/15 via-rose-500/5 to-transparent text-rose-600 dark:text-rose-400 [&_.stat-icon]:bg-rose-500/10 [&_.stat-icon]:text-rose-600 dark:[&_.stat-icon]:text-rose-400',
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, label, value, delta, trend, icon, accent = 'primary', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-2xl border bg-card p-5 shadow-soft-sm',
          'transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-0.5',
          'bg-gradient-to-br',
          accentMap[accent],
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
              {label}
            </p>
            <p className="text-3xl font-bold tracking-tight tabular-nums">{value}</p>
            {delta && (
              <p
                className={cn(
                  'text-xs font-medium flex items-center gap-1',
                  trend === 'up' && 'text-emerald-600 dark:text-emerald-400',
                  trend === 'down' && 'text-rose-600 dark:text-rose-400',
                  trend === 'flat' && 'text-muted-foreground'
                )}
              >
                {delta}
              </p>
            )}
          </div>
          {icon && (
            <div
              className={cn(
                'stat-icon flex h-11 w-11 items-center justify-center rounded-xl',
                'transition-transform duration-300 group-hover:scale-110'
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </div>
    )
  }
)
StatCard.displayName = 'StatCard'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardGlass, StatCard }
