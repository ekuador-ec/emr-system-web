import { useAuth } from '@/presentation/modules/auth/hooks/useAuth'
import { USER_ROLE_LABELS } from '@/domain/modules/users/models/User'

/**
 * Test Template
 */
export function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div style={{ padding: 'var(--space-8)', maxWidth: '960px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: 'var(--space-2)' }}>
        Bienvenido, {user.firstName || user.email}
      </h1>
      <p style={{ marginBottom: 'var(--space-8)' }}>
        Panel principal
      </p>

      {/* User info card */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-4)' }}>Tu Perfil</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 'var(--space-2) var(--space-4)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          <strong>Nombre:</strong>
          <span>{user.firstName} {user.lastName}</span>

          <strong>Email:</strong>
          <span>{user.email}</span>

          <strong>Rol:</strong>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-text)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-semibold)',
              width: 'fit-content',
            }}
          >
            {USER_ROLE_LABELS[user.role]}
          </span>
        </div>
      </div>
    </div>
  )
}
