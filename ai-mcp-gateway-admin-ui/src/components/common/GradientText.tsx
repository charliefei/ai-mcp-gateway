import * as React from 'react'
import { cn } from '@/lib/utils'

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
}

/**
 * Gradient text — animated, beautiful.
 */
export function GradientText({ children, className, ...props }: GradientTextProps) {
  return (
    <span
      className={cn(
        'bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent',
        'bg-[length:200%_auto] animate-[gradient-shift_6s_ease_infinite]',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
