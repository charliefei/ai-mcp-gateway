import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Wrench,
  Globe,
  Shield,
  Play,
  Server,
} from 'lucide-react'

const navItems = [
  { to: '/gateway', label: '网关配置', icon: Server },
  { to: '/tool', label: '工具配置', icon: Wrench },
  { to: '/protocol', label: '协议配置', icon: Globe },
  { to: '/auth', label: '认证配置', icon: Shield },
  { to: '/test', label: '网关测试', icon: Play },
]

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 bg-slate-900 text-slate-200 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/50">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <LayoutDashboard className="h-4 w-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight">MCP Gateway</h1>
          <p className="text-[10px] text-slate-400">Management Console</p>
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
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-700/50">
        <p className="text-[10px] text-slate-500">MCP Gateway v1.0.0</p>
      </div>
    </aside>
  )
}
