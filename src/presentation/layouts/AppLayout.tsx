import { useAuth } from '@/presentation/hooks/useAuth'
import { usePresenceTracker } from '@/presentation/hooks/usePresenceTracker'
import { ThemeToggle } from '@/presentation/components/ThemeToggle'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { UserProfileModal } from '@/presentation/components/UserProfileModal'
import { Toaster } from '@/presentation/components/Toaster'
import { Sidebar } from '@/presentation/components/Sidebar'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoggingOut } = useAuth()
  const navigate = useNavigate()
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  usePresenceTracker(user?.id)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row' }}>
      
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-3) var(--space-6)',
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            transition: 'background-color var(--transition-normal)',
            gap: 'var(--space-4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
            <nav style={{ display: 'flex', gap: 'var(--space-1)' }}>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {user && (
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setIsProfileModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'transparent'
                }}
              >
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt="Avatar" 
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                  }}>
                    {user.firstName?.charAt(0) || user.email.charAt(0)}
                  </div>
                )}
                <span
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {user.firstName || user.email}
                </span>
              </button>
            )}
            <ThemeToggle />
            <button
              type="button"
              className="btn-ghost"
              onClick={handleLogout}
              disabled={isLoggingOut}
              style={{ fontSize: 'var(--font-size-sm)' }}
            >
              {isLoggingOut ? 'Saliendo...' : 'Cerrar sesión'}
            </button>
          </div>
        </header>

        {/* Main content */}
        <main style={{ flex: 1, padding: 'var(--space-6)', overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      {/* Global Elements */}
      <UserProfileModal 
         isOpen={isProfileModalOpen} 
         onClose={() => setIsProfileModalOpen(false)} 
      />
      <Toaster />
    </div>
  )
}
