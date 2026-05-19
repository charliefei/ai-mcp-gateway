import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/use-theme'
import {
  Wrench,
  Globe,
  Shield,
  Play,
  Server,
  Moon,
  Sun,
  Sparkles,
} from 'lucide-react'

const navItems = [
  { to: '/gateway', label: '网关配置', en: 'Gateway', icon: Server },
  { to: '/tool', label: '工具配置', en: 'Tools', icon: Wrench },
  { to: '/protocol', label: '协议配置', en: 'Protocols', icon: Globe },
  { to: '/auth', label: '认证配置', en: 'Auth', icon: Shield },
  { to: '/test', label: '网关测试', en: 'Playground', icon: Play },
]

export function Sidebar() {
  const { isDark, toggle } = useTheme()

  return (
    <aside
      className={cn(
        'fixed left-4 top-4 bottom-4 z-40 w-60 flex flex-col overflow-hidden',
        'glass-strong rounded-3xl shadow-soft',
        'text-[hsl(var(--sidebar-fg))]'
      )}
    >
      {/* Subtle sheen */}
      <div className="pointer-events-none absolute inset-0 bg-glass-sheen" aria-hidden />

      {/* Brand */}
      <div className="relative px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-aurora-3 to-aurora-2 shadow-glow">
            <div className="absolute inset-0 rounded-2xl bg-glass-sheen" />
            <Sparkles className="relative h-5 w-5 text-white drop-shadow" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-bold tracking-tight leading-tight">
              MCP <span className="font-serif-display italic font-normal">Gateway</span>
            </h1>
            <p className="text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground/80">
              Control Plane
            </p>
          </div>
        </div>
      </div>

      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Navigation */}
      <nav className="relative flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
          Modules
        </p>
        {navItems.map((item, i) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
            style={{ animationDelay: `${60 + i * 40}ms` }}
          >
            {({ isActive }) => (
              <>
                {/* Active background pill */}
                <span
                  className={cn(
                    'absolute inset-0 rounded-xl transition-all duration-300',
                    isActive
                      ? 'bg-gradient-to-r from-primary/20 via-primary/10 to-transparent ring-1 ring-primary/30 shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.6)]'
                      : 'opacity-0 group-hover:opacity-100 group-hover:bg-foreground/[0.04]'
                  )}
                />
                {/* Luminous left bar */}
                <span
                  className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full transition-all duration-300',
                    isActive
                      ? 'bg-gradient-to-b from-primary to-aurora-3 shadow-[0_0_12px_hsl(var(--primary)/0.7)]'
                      : 'h-0 opacity-0'
                  )}
                />
                <item.icon
                  className={cn(
                    'relative h-4 w-4 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground/80 group-hover:text-foreground'
                  )}
                  strokeWidth={2.25}
                />
                <span className="relative flex-1">{item.label}</span>
                <span
                  className={cn(
                    'relative text-[10px] font-mono tracking-tighter transition-colors',
                    isActive ? 'text-primary/80' : 'text-muted-foreground/40'
                  )}
                >
                  {item.en}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Footer */}
      <div className="relative px-4 py-4 space-y-3">
        <button
          onClick={toggle}
          className="group flex w-full items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200 cursor-pointer"
          aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
        >
          <span className="flex items-center gap-2 font-medium">
            {isDark ? (
              <Sun className="h-3.5 w-3.5 text-warning" strokeWidth={2.25} />
            ) : (
              <Moon className="h-3.5 w-3.5 text-primary" strokeWidth={2.25} />
            )}
            {isDark ? '亮色模式' : '暗色模式'}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider opacity-60 group-hover:opacity-100 transition">
            {isDark ? 'light' : 'dark'}
          </span>
        </button>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
          <span className="font-mono">v1.0.0</span>
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            <span className="uppercase tracking-wider">live</span>
          </span>
        </div>
      </div>
    </aside>
  )
}
