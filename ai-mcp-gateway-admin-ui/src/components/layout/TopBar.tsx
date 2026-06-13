import { useLocation, Link } from 'react-router-dom'
import { useTheme } from '@/hooks/use-theme'
import { Bell, Moon, Search, Sun, Command, Github } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

const titleMap: Record<string, { title: string; parent?: string }> = {
  '/': { title: '概览' },
  '/gateway': { title: '网关配置' },
  '/tool': { title: '工具配置' },
  '/protocol': { title: '协议配置' },
  '/auth': { title: '认证配置' },
  '/test': { title: '网关测试' },
}

function getClock() {
  const d = new Date()
  return d.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

interface TopBarProps {
  onOpenSearch: () => void
}

export function TopBar({ onOpenSearch }: TopBarProps) {
  const location = useLocation()
  const { isDark, toggle } = useTheme()
  const [time, setTime] = useState(getClock())

  useEffect(() => {
    const id = setInterval(() => setTime(getClock()), 1000)
    return () => clearInterval(id)
  }, [])

  const current = titleMap[location.pathname] ?? { title: '控制台' }
  const segments = current.parent ? [current.parent, current.title] : [current.title]

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center gap-3 px-6',
        'border-b border-border/60 bg-background/70 backdrop-blur-xl',
        'transition-colors duration-200'
      )}
    >
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm">
        {segments.map((seg, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <span className="text-muted-foreground/40 text-xs">/</span>
            )}
            <span
              className={cn(
                i === segments.length - 1
                  ? 'font-semibold text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {seg}
            </span>
          </span>
        ))}
      </nav>

      {/* Global search trigger */}
      <button
        type="button"
        onClick={onOpenSearch}
        className={cn(
          'ml-6 hidden md:flex items-center gap-2 px-3 h-9 rounded-lg',
          'border border-border/60 bg-card/50 text-xs text-muted-foreground',
          'min-w-[280px] text-left cursor-pointer',
          'hover:border-primary/30 hover:text-foreground/80 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
        aria-label="全局搜索"
      >
        <Search className="h-3.5 w-3.5" />
        <span>搜索网关、工具、协议...</span>
        <span className="ml-auto inline-flex items-center gap-0.5 text-[10px]">
          <kbd className="inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-border/60 bg-background px-1 font-mono">
            <Command className="h-2.5 w-2.5" />
          </kbd>
          <kbd className="inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-border/60 bg-background px-1 font-mono">
            K
          </kbd>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground font-mono tabular-nums px-3 h-9 rounded-lg border border-border/60 bg-card/50">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-dot" />
          {time}
        </div>
        <button
          onClick={toggle}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card/50 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-card transition-all"
          aria-label="切换主题"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card/50 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-card transition-all"
          aria-label="通知"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </button>
        <a
          href="https://github.com/charliefei/ai-mcp-gateway"
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card/50 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-card transition-all"
          aria-label="GitHub"
        >
          <Github className="h-4 w-4" />
        </a>
      </div>
    </header>
  )
}
