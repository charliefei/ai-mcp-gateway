import * as React from 'react'
import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200',
          'border border-border/70 bg-background/40 backdrop-blur-md',
          'placeholder:text-muted-foreground/60',
          'hover:border-border-strong',
          'focus-visible:outline-none focus-visible:border-primary/60 focus-visible:bg-background/70 focus-visible:ring-4 focus-visible:ring-primary/15',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-y',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
