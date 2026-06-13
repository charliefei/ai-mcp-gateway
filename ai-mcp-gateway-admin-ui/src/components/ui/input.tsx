import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, ...props }, ref) => {
    if (leftIcon || rightIcon) {
      return (
        <div
          className={cn(
            'group relative flex h-9 w-full items-center rounded-lg border border-input bg-background/50 backdrop-blur-sm transition-all duration-200',
            'focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-background',
            'hover:border-primary/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
        >
          {leftIcon && (
            <div className="flex h-full items-center justify-center pl-3 text-muted-foreground [&_svg]:size-4">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'h-full w-full bg-transparent px-3 py-1 text-sm outline-none',
              'placeholder:text-muted-foreground/70',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'disabled:cursor-not-allowed',
              leftIcon && 'pl-1',
              rightIcon && 'pr-1'
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="flex h-full items-center justify-center pr-3 text-muted-foreground [&_svg]:size-4">
              {rightIcon}
            </div>
          )}
        </div>
      )
    }
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-lg border border-input bg-background/50 backdrop-blur-sm px-3 py-1 text-sm shadow-soft-sm',
          'transition-all duration-200',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
          'placeholder:text-muted-foreground/70',
          'focus-visible:outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-background',
          'hover:border-primary/30',
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
