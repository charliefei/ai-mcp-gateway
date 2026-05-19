import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { AuroraBackground } from './AuroraBackground'
import { Toaster } from 'sonner'

export function MainLayout() {
  return (
    <div className="relative min-h-screen text-foreground">
      <AuroraBackground />
      <Sidebar />
      <main className="ml-[17.5rem] pr-4 pl-2 pb-8 pt-4 min-h-screen">
        <div className="mx-auto max-w-[1400px] fade-up">
          <Outlet />
        </div>
      </main>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 3000,
          classNames: {
            toast:
              'glass !rounded-2xl !border-glass-border !shadow-soft !text-foreground !font-sans',
          },
        }}
      />
    </div>
  )
}
