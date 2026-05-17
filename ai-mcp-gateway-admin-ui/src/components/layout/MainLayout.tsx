import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Toaster } from 'sonner'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-56 min-h-screen">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 3000,
        }}
      />
    </div>
  )
}
