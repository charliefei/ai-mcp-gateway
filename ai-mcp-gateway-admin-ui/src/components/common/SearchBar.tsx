import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Search, X, SlidersHorizontal } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  onSearch: () => void
  onReset: () => void
  placeholder?: string
  className?: string
  filterSlot?: React.ReactNode
  rightSlot?: React.ReactNode
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  onReset,
  placeholder = '搜索...',
  className,
  filterSlot,
  rightSlot,
}: SearchBarProps) {
  const hasValue = value.length > 0

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap',
        className
      )}
    >
      <div className="relative flex-1 min-w-[240px] max-w-md group">
        <Search
          className={cn(
            'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors',
            hasValue ? 'text-primary' : 'text-muted-foreground'
          )}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          placeholder={placeholder}
          className={cn(
            'h-10 w-full rounded-lg border border-input bg-card/50 backdrop-blur-sm pl-9 pr-9 text-sm shadow-soft-sm',
            'transition-all duration-200',
            'placeholder:text-muted-foreground/70',
            'focus-visible:outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-card',
            'hover:border-primary/30'
          )}
        />
        {hasValue && (
          <button
            onClick={() => onChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="清空"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {filterSlot}
      <div className="flex items-center gap-2 sm:ml-auto">
        {rightSlot}
        <Button
          variant="outline"
          size="sm"
          onClick={onSearch}
          className="cursor-pointer"
        >
          <Search className="h-3.5 w-3.5" />
          搜索
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="cursor-pointer text-muted-foreground hover:text-foreground"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          重置
        </Button>
      </div>
    </div>
  )
}
