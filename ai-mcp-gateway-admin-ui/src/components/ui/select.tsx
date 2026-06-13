import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'group flex h-9 w-full items-center justify-between gap-2 rounded-lg',
      'border border-input bg-background/50 backdrop-blur-sm px-3 py-1 text-sm shadow-soft-sm',
      'transition-all duration-200',
      'hover:border-primary/30 hover:bg-background',
      'focus-visible:outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20',
      'data-[placeholder]:text-muted-foreground/70',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'cursor-pointer text-left',
      'data-[state=open]:border-primary/60 data-[state=open]:ring-2 data-[state=open]:ring-primary/20 data-[state=open]:bg-background',
      '[&>span]:truncate',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-[1000] max-h-96 min-w-[8rem] overflow-hidden rounded-xl',
        'border border-border bg-card/95 backdrop-blur-xl text-card-foreground shadow-soft-xl',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-xs font-semibold text-muted-foreground', className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
    /**
     * Optional custom label — when provided, the value is hidden and this
     * rich ReactNode is shown. Useful for HTTP methods with colored pills, etc.
     */
    richLabel?: React.ReactNode
  }
>(({ className, children, richLabel, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none',
      'transition-colors duration-100',
      'focus:bg-primary/10 focus:text-foreground',
      'data-[state=checked]:bg-primary/5 data-[state=checked]:text-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-3.5 w-3.5 text-primary" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{richLabel ?? children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

/* ----------------------------------------------------------------------------
 * Shim: Select — the flat `options` API the rest of the app already uses.
 * Internally renders Radix Select primitives so we get battle-tested
 * positioning, focus management, keyboard nav, and ARIA for free.
 * --------------------------------------------------------------------------*/

export interface SelectOption<V extends string = string> {
  value: V
  label: React.ReactNode
  description?: string
  icon?: React.ReactNode
  optionClassName?: string
}

interface FlatSelectProps<V extends string = string> {
  value: V
  onChange: (v: V) => void
  options: SelectOption<V>[]
  placeholder?: string
  disabled?: boolean
  id?: string
  className?: string
  /** Rendered on the left of the value in the trigger. */
  leadingIcon?: React.ReactNode
  /** Aria label for the trigger. */
  'aria-label'?: string
}

/**
 * Flat-options API wrapper over Radix Select primitives.
 * Keeps existing call sites in the pages untouched.
 */
function FlatSelect<V extends string = string>({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  id,
  className,
  leadingIcon,
  'aria-label': ariaLabel,
}: FlatSelectProps<V>) {
  const selected = options.find((o) => o.value === value)
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as V)}
      disabled={disabled}
    >
      <SelectTrigger id={id} className={className} aria-label={ariaLabel}>
        <span className="flex items-center gap-2 min-w-0 flex-1">
          {leadingIcon && (
            <span className="text-muted-foreground shrink-0 flex">{leadingIcon}</span>
          )}
          <SelectValue placeholder={placeholder ?? '请选择...'} />
        </span>
      </SelectTrigger>
      <SelectContent>
        {options.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            没有可选项
          </div>
        ) : (
          options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className={opt.optionClassName}
              richLabel={
                <>
                  {opt.icon && (
                    <span className="inline-flex shrink-0 mr-1.5 text-muted-foreground">
                      {opt.icon}
                    </span>
                  )}
                  <span>{typeof opt.label === 'string' ? opt.label : opt.value}</span>
                  {opt.description && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {opt.description}
                    </span>
                  )}
                </>
              }
            />
          ))
        )}
      </SelectContent>
    </Select>
  )
}

export {
  FlatSelect as Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}

// Radix primitive re-exports for advanced composition use cases.
export { SelectPrimitive }
