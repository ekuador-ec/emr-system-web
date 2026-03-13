import { useAuth } from '@/presentation/hooks/useAuth'
import { usePresenceTracker } from '@/presentation/hooks/usePresenceTracker'
import { ThemeToggle } from '@/presentation/components/ThemeToggle'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { UserProfileModal } from '@/presentation/components/UserProfileModal'
import { Toaster } from '@/presentation/components/Toaster'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoggingOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  usePresenceTracker(user?.id)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
        {/* Left: Brand + Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
          <Link
            to="/"
            style={{
              fontSize: 'var(--font-size-lg)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--font-weight-extrabold)',
              color: 'var(--color-text)',
              textDecoration: 'none',
            }}
          >
            EMR System
          </Link>

          <nav style={{ display: 'flex', gap: 'var(--space-1)' }}>
            <NavLink to="/" label="Inicio" active={isActive('/')} />
            {isAdmin && (
              <NavLink to="/admin/users" label="Usuarios" active={isActive('/admin/users')} />
            )}
          </nav>
        </div>

        {/* Right: User info + Actions */}
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
      <main style={{ flex: 1 }}>{children}</main>

      {/* Global Elements */}
      <UserProfileModal 
         isOpen={isProfileModalOpen} 
         onClose={() => setIsProfileModalOpen(false)} 
      />
      <Toaster />
    </div>
  )
}

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      style={{
        padding: 'var(--space-1) var(--space-3)',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--font-size-sm)',
        fontWeight: active ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)',
        color: active ? 'var(--color-text)' : 'var(--color-text-secondary)',
        backgroundColor: active ? 'var(--color-primary-light)' : 'transparent',
        textDecoration: 'none',
        transition: 'all var(--transition-fast)',
      }}
    >
      {label}
    </Link>
  )
}
