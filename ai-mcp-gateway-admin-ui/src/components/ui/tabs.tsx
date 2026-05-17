import * as React from 'react'
import { useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextType {
  activeTab: string
  setActiveTab: (value: string) => void
  tabValues: string[]
  registerTab: (value: string) => void
  focusTab: (value: string) => void
}

const TabsContext = React.createContext<TabsContextType | null>(null)

interface TabsProps {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const [tabValues, setTabValues] = React.useState<string[]>([])
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const activeTab = value !== undefined ? value : internalValue

  const setActiveTab = (v: string) => {
    setInternalValue(v)
    onValueChange?.(v)
  }

  const registerTab = useCallback((v: string) => {
    setTabValues((prev) => {
      if (prev.includes(v)) return prev
      return [...prev, v]
    })
  }, [])

  const focusTab = useCallback((v: string) => {
    tabRefs.current.get(v)?.focus()
  }, [])

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, tabValues, registerTab, focusTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error('TabsList must be used within Tabs')

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const { tabValues, activeTab, setActiveTab, focusTab } = ctx
    const currentIndex = tabValues.indexOf(activeTab)
    let nextIndex = -1

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        nextIndex = currentIndex + 1 >= tabValues.length ? 0 : currentIndex + 1
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        nextIndex = currentIndex - 1 < 0 ? tabValues.length - 1 : currentIndex - 1
        break
      case 'Home':
        e.preventDefault()
        nextIndex = 0
        break
      case 'End':
        e.preventDefault()
        nextIndex = tabValues.length - 1
        break
    }

    if (nextIndex >= 0) {
      setActiveTab(tabValues[nextIndex])
      focusTab(tabValues[nextIndex])
    }
  }

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
        className
      )}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  )
}

function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error('TabsTrigger must be used within Tabs')

  React.useEffect(() => {
    ctx.registerTab(value)
  }, [value, ctx])

  const isActive = ctx.activeTab === value

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      tabIndex={isActive ? 0 : -1}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
        isActive && 'bg-background text-foreground shadow',
        className
      )}
      onClick={() => ctx.setActiveTab(value)}
    >
      {children}
    </button>
  )
}

function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error('TabsContent must be used within Tabs')
  if (ctx.activeTab !== value) return null
  return (
    <div role="tabpanel" id={`tabpanel-${value}`} aria-labelledby={`tab-${value}`} className={cn('mt-2', className)}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
