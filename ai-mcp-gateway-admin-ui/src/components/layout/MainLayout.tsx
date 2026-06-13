import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { GlobalSearch } from './GlobalSearch'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Global ⌘K / Ctrl+K shortcut to open the search palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')
      if (isCmdK) {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div
        className={cn(
          'min-h-screen flex flex-col',
          'transition-[margin] duration-300 ease-out-expo',
          collapsed ? 'ml-[68px]' : 'ml-60'
        )}
      >
        <TopBar onOpenSearch={() => setSearchOpen(true)} />
        <main className="flex-1 px-6 py-6 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <Toaster
        position="top-right"
        richColors
        closeButton
        visibleToasts={4}
        expand
        toastOptions={{
          duration: 3500,
          classNames: {
            toast:
              'group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border/60 group-[.toaster]:shadow-soft-lg group-[.toaster]:rounded-xl group-[.toaster]:backdrop-blur-xl',
            description: 'group-[.toast]:text-muted-foreground group-[.toast]:text-xs',
            actionButton:
              'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
            cancelButton:
              'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
            title: 'group-[.toast]:text-sm group-[.toast]:font-semibold',
          },
        }}
      />
    </div>
  )
}
