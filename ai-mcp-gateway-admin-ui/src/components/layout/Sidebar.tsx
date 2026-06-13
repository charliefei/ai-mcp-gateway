import { NavLink, useLocation } from 'react-router-dom'
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
  LayoutDashboard,
  PanelLeftClose,
  PanelLeft,
  Github,
} from 'lucide-react'

const navItems = [
  { to: '/', label: '概览', icon: LayoutDashboard, exact: true },
  { to: '/gateway', label: '网关配置', icon: Server },
  { to: '/tool', label: '工具配置', icon: Wrench },
  { to: '/protocol', label: '协议配置', icon: Globe },
  { to: '/auth', label: '认证配置', icon: Shield },
  { to: '/test', label: '网关测试', icon: Play },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { isDark, toggle } = useTheme()
  const location = useLocation()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen flex flex-col',
        'bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-fg))]',
        'border-r border-[hsl(var(--sidebar-border))]',
        'transition-[width] duration-300 ease-out-expo will-change-[width]',
        collapsed ? 'w-[68px]' : 'w-60',
        'shadow-soft-lg'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center gap-3 border-b border-[hsl(var(--sidebar-border))]',
          'h-16 shrink-0',
          collapsed ? 'justify-center px-0' : 'px-4'
        )}
      >
        <div
          className={cn(
            'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden',
            'bg-gradient-to-br from-primary via-purple-500 to-pink-500',
            'shadow-glow'
          )}
        >
          <Sparkles className="h-4 w-4 text-white relative z-10" />
          <div
            className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0"
            aria-hidden
          />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0 animate-in fade-in-0 slide-in-from-left-2">
            <h1 className="text-sm font-bold tracking-tight truncate text-white">
              MCP Gateway
            </h1>
            <p className="text-[10px] text-[hsl(var(--sidebar-muted))] tracking-wide uppercase">
              Management Console
            </p>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-white transition-colors"
            aria-label="折叠侧边栏"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center pt-3">
          <button
            onClick={onToggle}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-white transition-colors"
            aria-label="展开侧边栏"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname === item.to ||
              (item.to !== '/' && location.pathname.startsWith(item.to))
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                'transition-all duration-200',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-[hsl(var(--sidebar-hover))] text-white shadow-soft-sm'
                  : 'text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-hover))]/60 hover:text-white'
              )}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-gradient-to-b from-primary to-purple-400"
                  aria-hidden
                />
              )}
              <item.icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform',
                  isActive && 'text-[hsl(var(--sidebar-active))] scale-110',
                  !isActive && 'group-hover:scale-110'
                )}
              />
              {!collapsed && (
                <span className="truncate animate-in fade-in-0 slide-in-from-left-2">
                  {item.label}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div
        className={cn(
          'border-t border-[hsl(var(--sidebar-border))] space-y-2 shrink-0',
          collapsed ? 'p-2' : 'p-4'
        )}
      >
        <button
          onClick={toggle}
          className={cn(
            'flex items-center w-full rounded-lg py-2 text-xs',
            'text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-white transition-all duration-200',
            collapsed ? 'justify-center px-0' : 'gap-2 px-2.5'
          )}
          aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
        >
          {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          {!collapsed && (isDark ? '亮色模式' : '暗色模式')}
        </button>
        {!collapsed && (
          <div className="rounded-lg border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-hover))]/30 p-3 space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[hsl(var(--sidebar-muted))]">v1.0.0</span>
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
                Healthy
              </span>
            </div>
            <a
              href="https://github.com/charliefei/ai-mcp-gateway"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--sidebar-muted))] hover:text-white transition-colors"
            >
              <Github className="h-3 w-3" />
              Documentation
            </a>
          </div>
        )}
      </div>
    </aside>
  )
}
