import * as React from 'react'
import { Check, Copy, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ApiKeyCellProps {
  value: string
  className?: string
}

export function ApiKeyCell({ value, className }: ApiKeyCellProps) {
  const [revealed, setRevealed] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const display = !value
    ? '—'
    : revealed
      ? value
      : `${value.slice(0, 6)}••••••••${value.slice(-4)}`

  const handleCopy = async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 max-w-full group',
        className
      )}
    >
      <code
        className={cn(
          'font-mono text-xs px-2 py-0.5 rounded-md border border-border/60 bg-muted/40',
          'text-foreground/90 truncate transition-colors',
          revealed && 'whitespace-normal break-all'
        )}
      >
        {display}
      </code>
      <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          disabled={!value}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label={revealed ? '隐藏' : '显示'}
        >
          {revealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!value}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="复制"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
    </div>
  )
}
