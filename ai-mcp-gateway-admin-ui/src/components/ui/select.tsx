import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            'flex h-10 w-full appearance-none rounded-xl px-3.5 pr-9 py-1.5 text-sm transition-all duration-200',
            'border border-border/70 bg-background/40 backdrop-blur-md',
            'text-foreground',
            'hover:border-border-strong',
            'focus-visible:outline-none focus-visible:border-primary/60 focus-visible:bg-background/70 focus-visible:ring-4 focus-visible:ring-primary/15',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'cursor-pointer',
            className
          )}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70"
          aria-hidden="true"
        />
      </div>
    )
  }
)
Select.displayName = 'Select'

export { Select }
