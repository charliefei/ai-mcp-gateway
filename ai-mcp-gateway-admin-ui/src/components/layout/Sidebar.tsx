import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/use-theme'
import {
  LayoutDashboard,
  Wrench,
  Globe,
  Shield,
  Play,
  Server,
  Moon,
  Sun,
} from 'lucide-react'

const navItems = [
  { to: '/gateway', label: '网关配置', icon: Server },
  { to: '/tool', label: '工具配置', icon: Wrench },
  { to: '/protocol', label: '协议配置', icon: Globe },
  { to: '/auth', label: '认证配置', icon: Shield },
  { to: '/test', label: '网关测试', icon: Play },
]

export function Sidebar() {
  const { isDark, toggle } = useTheme()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-fg))] flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold tracking-tight truncate">MCP Gateway</h1>
          <p className="text-[10px] text-[hsl(var(--sidebar-muted))]">Management Console</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary/20 text-[hsl(var(--sidebar-active))]'
                  : 'text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-fg))]'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10 space-y-3">
        <button
          onClick={toggle}
          className="flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-xs text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-fg))] transition-colors duration-150 cursor-pointer"
          aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
        >
          {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          {isDark ? '亮色模式' : '暗色模式'}
        </button>
        <p className="text-[10px] text-[hsl(var(--sidebar-muted))]">MCP Gateway v1.0.0</p>
      </div>
    </aside>
  )
}
