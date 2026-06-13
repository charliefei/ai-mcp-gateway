import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
    'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-primary/10 text-primary border border-primary/15 hover:bg-primary/15',
        secondary:
          'bg-secondary text-secondary-foreground border border-transparent hover:bg-secondary/80',
        destructive:
          'bg-destructive/10 text-destructive border border-destructive/15 hover:bg-destructive/15',
        outline: 'text-foreground border border-border bg-background/50',
        success:
          'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
        warning:
          'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
        info: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20',
        ghost: 'bg-muted text-muted-foreground border border-transparent',
        // HTTP method-style colored pill (for protocol pages)
        get: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25',
        post: 'bg-sky-500/12 text-sky-700 dark:text-sky-400 border border-sky-500/25',
        put: 'bg-amber-500/12 text-amber-700 dark:text-amber-400 border border-amber-500/25',
        delete: 'bg-rose-500/12 text-rose-700 dark:text-rose-400 border border-rose-500/25',
        patch: 'bg-violet-500/12 text-violet-700 dark:text-violet-400 border border-violet-500/25',
      },
      size: {
        default: 'text-xs',
        sm: 'text-[10px] px-2 py-0',
        lg: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { Badge, badgeVariants }
