import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl px-3.5 py-1.5 text-sm transition-all duration-200',
          'border border-border/70 bg-background/40 backdrop-blur-md',
          'placeholder:text-muted-foreground/60',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
          'hover:border-border-strong',
          'focus-visible:outline-none focus-visible:border-primary/60 focus-visible:bg-background/70 focus-visible:ring-4 focus-visible:ring-primary/15',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
