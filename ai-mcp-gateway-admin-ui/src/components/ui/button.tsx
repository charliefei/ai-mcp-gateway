import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium',
    'transition-all duration-200 ease-out-expo',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    'active:scale-[0.98]',
    'relative overflow-hidden',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'bg-primary text-primary-foreground shadow-soft',
          'hover:bg-primary/90 hover:shadow-glow hover:-translate-y-px',
        ].join(' '),
        destructive: [
          'bg-destructive text-destructive-foreground shadow-soft',
          'hover:bg-destructive/90 hover:shadow-[0_4px_16px_-4px_hsl(var(--destructive)/0.4)] hover:-translate-y-px',
        ].join(' '),
        outline: [
          'border border-border bg-card/50 backdrop-blur-sm text-foreground',
          'hover:bg-accent hover:text-accent-foreground hover:border-primary/30 hover:shadow-soft',
        ].join(' '),
        secondary: [
          'bg-secondary text-secondary-foreground',
          'hover:bg-secondary/80',
        ].join(' '),
        ghost: [
          'text-foreground',
          'hover:bg-accent hover:text-accent-foreground',
        ].join(' '),
        link: 'text-primary underline-offset-4 hover:underline',
        gradient: [
          'text-white shadow-soft',
          'bg-gradient-to-r from-primary via-purple-500 to-pink-500',
          'hover:shadow-glow-lg hover:-translate-y-px',
          'before:absolute before:inset-0 before:bg-gradient-to-r before:from-pink-500 before:via-purple-500 before:to-primary before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500',
        ].join(' '),
        glass: [
          'glass text-foreground shadow-soft',
          'hover:bg-card/80 hover:shadow-soft-lg hover:-translate-y-px',
        ].join(' '),
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs gap-1.5',
        lg: 'h-11 rounded-lg px-6 text-base',
        xl: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-9 w-9',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
