import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  cn(
    'relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium',
    'rounded-xl text-sm tracking-tight',
    'transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    'active:scale-[0.98]'
  ),
  {
    variants: {
      variant: {
        default: cn(
          'text-primary-foreground',
          'bg-gradient-to-b from-primary to-primary/85',
          'shadow-[0_1px_0_hsl(0_0%_100%/0.25)_inset,0_8px_24px_-8px_hsl(var(--primary)/0.5)]',
          'hover:shadow-[0_1px_0_hsl(0_0%_100%/0.3)_inset,0_12px_32px_-8px_hsl(var(--primary)/0.65)]',
          'hover:from-primary hover:to-primary'
        ),
        destructive: cn(
          'text-destructive-foreground bg-destructive/95',
          'shadow-[0_1px_0_hsl(0_0%_100%/0.18)_inset,0_8px_24px_-8px_hsl(var(--destructive)/0.5)]',
          'hover:bg-destructive'
        ),
        outline: cn(
          'border border-border bg-background/40 backdrop-blur-md',
          'text-foreground',
          'hover:bg-background/70 hover:border-primary/40 hover:text-foreground'
        ),
        secondary: cn(
          'bg-secondary/70 text-secondary-foreground backdrop-blur-md',
          'border border-border/50',
          'hover:bg-secondary'
        ),
        ghost: cn(
          'text-muted-foreground',
          'hover:bg-foreground/[0.06] hover:text-foreground'
        ),
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs rounded-lg',
        lg: 'h-11 px-6 text-[15px] rounded-2xl',
        icon: 'h-9 w-9 rounded-xl',
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
