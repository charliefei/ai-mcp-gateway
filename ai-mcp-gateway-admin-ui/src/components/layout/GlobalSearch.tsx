import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog } from '@/components/ui/dialog'
import { searchApi } from '@/lib/api'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'
import {
  Search,
  Loader2,
  Server,
  Wrench,
  Globe,
  Shield,
  Hash,
  CornerDownLeft,
  ChevronRight,
  SearchX,
} from 'lucide-react'
import type { GlobalSearchCategory, GlobalSearchItem, GlobalSearchItemType } from '@/types'

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CATEGORY_META: Record<
  GlobalSearchItemType,
  { label: string; icon: React.ReactNode; accent: string }
> = {
  gateway: {
    label: '网关',
    icon: <Server className="h-3.5 w-3.5" />,
    accent: 'text-primary',
  },
  tool: {
    label: '工具',
    icon: <Wrench className="h-3.5 w-3.5" />,
    accent: 'text-sky-600 dark:text-sky-400',
  },
  protocol: {
    label: '协议',
    icon: <Globe className="h-3.5 w-3.5" />,
    accent: 'text-emerald-600 dark:text-emerald-400',
  },
  auth: {
    label: '认证',
    icon: <Shield className="h-3.5 w-3.5" />,
    accent: 'text-amber-600 dark:text-amber-400',
  },
}

const PER_CATEGORY_LIMIT = 5

type FlatEntry =
  | { kind: 'item'; category: GlobalSearchCategory; item: GlobalSearchItem; flatIndex: number }
  | { kind: 'viewAll'; category: GlobalSearchCategory; flatIndex: number }

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const debounced = useDebounce(keyword.trim(), 200)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ keyword: string; categories: GlobalSearchCategory[] } | null>(
    null,
  )
  const [highlight, setHighlight] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset state when the dialog opens
  useEffect(() => {
    if (open) {
      setKeyword('')
      setResult(null)
      setHighlight(0)
      // focus the input on the next tick after the dialog mounts
      const t = setTimeout(() => inputRef.current?.focus(), 30)
      return () => clearTimeout(t)
    }
  }, [open])

  // Debounced search
  useEffect(() => {
    if (!open) return
    if (!debounced) {
      setResult(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    searchApi
      .globalSearch(debounced, PER_CATEGORY_LIMIT)
      .then((data) => {
        if (cancelled) return
        setResult({ keyword: data?.keyword ?? debounced, categories: data?.categories ?? [] })
        setHighlight(0)
      })
      .catch(() => {
        if (cancelled) return
        setResult({ keyword: debounced, categories: [] })
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [debounced, open])

  // Flatten the visible result list for keyboard navigation
  const flat: FlatEntry[] = useMemo(() => {
    if (!result) return []
    const entries: FlatEntry[] = []
    let i = 0
    for (const cat of result.categories) {
      for (const item of cat.items) {
        entries.push({ kind: 'item', category: cat, item, flatIndex: i })
        i++
      }
      if (cat.truncated > 0) {
        entries.push({ kind: 'viewAll', category: cat, flatIndex: i })
        i++
      }
    }
    return entries
  }, [result])

  // Clamp highlight when the list changes
  useEffect(() => {
    if (highlight >= flat.length) setHighlight(Math.max(0, flat.length - 1))
  }, [flat.length, highlight])

  function activate(entry: FlatEntry) {
    if (entry.kind === 'item') {
      navigateTo(entry.item.path)
    } else {
      navigateTo(entry.category.type)
    }
  }

  function navigateTo(pathOrType: string) {
    const path = pathOrType.startsWith('/') ? pathOrType : `/${pathOrType}`
    const trimmed = debounced || keyword.trim()
    const url = trimmed ? `${path}?q=${encodeURIComponent(trimmed)}` : path
    onOpenChange(false)
    navigate(url)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (flat.length > 0) setHighlight((h) => (h + 1) % flat.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (flat.length > 0) setHighlight((h) => (h - 1 + flat.length) % flat.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const entry = flat[highlight]
      if (entry) activate(entry)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="md">
      <div className="flex max-h-[80vh] flex-col">
        {/* Input row */}
        <div className="flex items-center gap-3 px-5 h-14 border-b bg-gradient-to-b from-muted/30 to-transparent">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索网关、工具、协议、认证…"
            className={cn(
              'flex-1 bg-transparent text-sm outline-none',
              'placeholder:text-muted-foreground/70',
            )}
            aria-label="全局搜索"
            autoComplete="off"
            spellCheck={false}
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <kbd className="hidden sm:inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border/60 bg-background px-1.5 text-[10px] font-mono text-muted-foreground">
            Esc
          </kbd>
        </div>

        {/* Result body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {!debounced ? (
            <HintEmpty />
          ) : loading && !result ? (
            <LoadingState />
          ) : result && result.categories.length === 0 ? (
            <NoMatch keyword={result.keyword} />
          ) : (
            <ResultList
              categories={result?.categories ?? []}
              flat={flat}
              highlight={highlight}
              setHighlight={setHighlight}
              onActivate={activate}
            />
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-3 px-5 h-10 border-t bg-muted/20 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <kbd className="inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-border/60 bg-background px-1 font-mono">
              ↑
            </kbd>
            <kbd className="inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-border/60 bg-background px-1 font-mono">
              ↓
            </kbd>
            选择
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-border/60 bg-background px-1 font-mono">
              <CornerDownLeft className="h-2.5 w-2.5" />
            </kbd>
            打开
          </span>
          <span className="ml-auto font-mono tabular-nums">
            {result?.categories
              ? result.categories.reduce((sum, c) => sum + c.items.length, 0) + ' 条结果'
              : '—'}
          </span>
        </div>
      </div>
    </Dialog>
  )
}

function HintEmpty() {
  return (
    <div className="px-5 py-10 text-center text-sm text-muted-foreground">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted/40 text-muted-foreground/60">
        <Search className="h-5 w-5" />
      </div>
      输入关键字开始搜索 — 支持网关 ID / 名称、工具名、URL、API Key 等
    </div>
  )
}

function LoadingState() {
  return (
    <div className="px-5 py-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      正在搜索…
    </div>
  )
}

function NoMatch({ keyword }: { keyword: string }) {
  return (
    <div className="px-5 py-12 text-center text-sm text-muted-foreground">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted/40 text-muted-foreground/60">
        <SearchX className="h-5 w-5" />
      </div>
      <p>
        没有匹配 <span className="font-mono text-foreground/80">{keyword}</span> 的结果
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">试试缩短关键字或检查拼写</p>
    </div>
  )
}

function ResultList({
  categories,
  flat,
  highlight,
  setHighlight,
  onActivate,
}: {
  categories: GlobalSearchCategory[]
  flat: FlatEntry[]
  highlight: number
  setHighlight: (h: number) => void
  onActivate: (entry: FlatEntry) => void
}) {
  let runningIndex = -1
  return (
    <div className="py-2">
      {categories.map((cat) => {
        const meta = CATEGORY_META[cat.type]
        return (
          <div key={cat.type} className="mb-2 last:mb-0">
            {/* Category header */}
            <div className="flex items-center gap-2 px-5 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              <span className={meta.accent}>{meta.icon}</span>
              <span className="font-semibold">{meta.label}</span>
              <span className="text-muted-foreground/60 tabular-nums">{cat.count}</span>
            </div>
            {/* Items */}
            <ul>
              {cat.items.map((item) => {
                runningIndex++
                const isActive = runningIndex === highlight
                const isItemEntry = flat[runningIndex]?.kind === 'item'
                return (
                  <li key={`${cat.type}-${item.id}`}>
                    <button
                      type="button"
                      onMouseEnter={() => isItemEntry && setHighlight(runningIndex)}
                      onClick={() => onActivate(flat[runningIndex])}
                      className={cn(
                        'group flex w-full items-center gap-3 px-5 py-2.5 text-left',
                        'transition-colors duration-100',
                        isActive ? 'bg-primary/10 text-foreground' : 'hover:bg-muted/40',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-md shrink-0',
                          'bg-gradient-to-br ring-1',
                          cat.type === 'gateway' &&
                            'from-primary/15 to-primary/0 ring-primary/20 text-primary',
                          cat.type === 'tool' &&
                            'from-sky-500/15 to-sky-500/0 ring-sky-500/20 text-sky-600 dark:text-sky-400',
                          cat.type === 'protocol' &&
                            'from-emerald-500/15 to-emerald-500/0 ring-emerald-500/20 text-emerald-600 dark:text-emerald-400',
                          cat.type === 'auth' &&
                            'from-amber-500/15 to-amber-500/0 ring-amber-500/20 text-amber-600 dark:text-amber-400',
                        )}
                      >
                        {meta.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{item.title || '—'}</p>
                          {item.badge && (
                            <span
                              className={cn(
                                'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold',
                                methodBadgeColor(item.badge),
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {(item.subtitle || item.description) && (
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                            {item.subtitle && (
                              <span className="inline-flex items-center gap-1 font-mono truncate">
                                <Hash className="h-3 w-3 shrink-0" />
                                {item.subtitle}
                              </span>
                            )}
                            {item.description && (
                              <span className="truncate">· {item.description}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 shrink-0 transition-all',
                          isActive ? 'text-foreground translate-x-0 opacity-100' : 'opacity-0 -translate-x-1',
                        )}
                      />
                    </button>
                  </li>
                )
              })}
              {cat.truncated > 0 && (
                <li>
                  {(() => {
                    runningIndex++
                    const isActive = runningIndex === highlight
                    return (
                      <button
                        type="button"
                        onMouseEnter={() => setHighlight(runningIndex)}
                        onClick={() => onActivate(flat[runningIndex])}
                        className={cn(
                          'flex w-full items-center gap-2 px-5 py-2 text-xs',
                          'transition-colors',
                          isActive
                            ? 'text-foreground bg-primary/5'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40',
                        )}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                        查看 {cat.label}全部{' '}
                        <span className="font-mono tabular-nums">
                          {cat.count}
                        </span>{' '}
                        条结果 →
                      </button>
                    )
                  })()}
                </li>
              )}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function methodBadgeColor(method: string): string {
  const m = method.toUpperCase()
  if (m === 'GET') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
  if (m === 'POST') return 'bg-sky-500/10 text-sky-700 dark:text-sky-300'
  if (m === 'PUT' || m === 'PATCH') return 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
  if (m === 'DELETE') return 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
  return 'bg-muted text-muted-foreground'
}
