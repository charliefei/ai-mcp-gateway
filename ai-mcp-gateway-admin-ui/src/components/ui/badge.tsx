import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  cn(
    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
  ),
  {
    variants: {
      variant: {
        default: cn(
          'bg-primary/15 text-primary border border-primary/25',
          'dark:bg-primary/20 dark:text-primary-glow dark:border-primary/40'
        ),
        secondary: cn(
          'bg-foreground/[0.06] text-foreground/80 border border-border/60'
        ),
        destructive: cn(
          'bg-destructive/15 text-destructive border border-destructive/30',
          'dark:bg-destructive/25 dark:text-destructive-foreground dark:border-destructive/40'
        ),
        outline: 'text-foreground border border-border/60 bg-background/40 backdrop-blur-sm',
        success: cn(
          'bg-success/15 text-success border border-success/30',
          'dark:bg-success/20 dark:border-success/40'
        ),
        warning: cn(
          'bg-warning/15 text-warning border border-warning/30',
          'dark:bg-warning/20 dark:border-warning/40'
        ),
        info: cn(
          'bg-aurora-2/15 text-foreground border border-aurora-2/30',
          'dark:text-aurora-2'
        ),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
