import { useState } from 'react'
import { useAuth } from '@/presentation/hooks/useAuth'
import { useAdminUsers } from '@/presentation/hooks/useAdminUsers'
import { usePresenceSubscription } from '@/presentation/hooks/usePresence'
import type { AccountStatus, InviteUserPayload, UserRole, UserWithPresence } from '@/domain/models/User'
import { USER_ROLE_LABELS, ACCOUNT_STATUS_LABELS } from '@/domain/models/User'

export function UsersManagementPage() {
  const { user: currentUser } = useAuth()
  const {
    users,
    isLoading,
    inviteUser,
    isInviting,
    toggleUserStatus,
    isTogglingStatus,
    softDeleteUser,
    isSoftDeleting,
  } = useAdminUsers()

  usePresenceSubscription()

  const [showInviteForm, setShowInviteForm] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <p>Cargando usuarios...</p>
      </div>
    )
  }

  const activeUsers = users.filter((u) => !u.deletedAt)
  const deletedUsers = users.filter((u) => u.deletedAt)

  return (
    <div style={{ padding: 'var(--space-8)', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-6)',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>Gestión de Usuarios</h1>
          <p style={{ fontSize: 'var(--font-size-sm)' }}>
            {activeUsers.length} usuarios activos · {deletedUsers.length} eliminados
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowInviteForm(!showInviteForm)}
        >
          {showInviteForm ? 'Cancelar' : '+ Invitar Usuario'}
        </button>
      </div>

      {/* Invite form */}
      {showInviteForm && (
        <InviteForm
          onInvite={async (payload) => {
            await inviteUser(payload)
            setShowInviteForm(false)
          }}
          isInviting={isInviting}
        />
      )}

      {/* Active users table */}
      <div className="card" style={{ overflowX: 'auto', marginBottom: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>Usuarios Activos</h3>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '2px solid var(--color-border)',
                textAlign: 'left',
              }}
            >
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Rol</th>
              <th style={thStyle}>Cuenta</th>
              <th style={thStyle}>Última conexión</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {activeUsers.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                isOnline={u.isOnline}
                isSelf={u.id === currentUser?.id}
                onToggleStatus={toggleUserStatus}
                isTogglingStatus={isTogglingStatus}
                onDelete={() => setDeleteConfirmId(u.id)}
              />
            ))}
            {activeUsers.length === 0 && (
              <tr>
                <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Deleted users (audit) */}
      {deletedUsers.length > 0 && (
        <div className="card" style={{ overflowX: 'auto', opacity: 0.7 }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Usuarios Eliminados (Auditoría)</h3>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Rol</th>
                <th style={thStyle}>Eliminado el</th>
              </tr>
            </thead>
            <tbody>
              {deletedUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={tdStyle}>{u.firstName} {u.lastName}</td>
                  <td style={tdStyle}>{u.email}</td>
                  <td style={tdStyle}>{USER_ROLE_LABELS[u.role]}</td>
                  <td style={tdStyle}>{formatDate(u.deletedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <ConfirmDeleteModal
          user={users.find((u) => u.id === deleteConfirmId)!}
          onConfirm={async () => {
            await softDeleteUser(deleteConfirmId)
            setDeleteConfirmId(null)
          }}
          onCancel={() => setDeleteConfirmId(null)}
          isDeleting={isSoftDeleting}
        />
      )}
    </div>
  )
}


function UserRow({
  user,
  isOnline,
  isSelf,
  onToggleStatus,
  isTogglingStatus,
  onDelete,
}: {
  user: UserWithPresence
  isOnline: boolean
  isSelf: boolean
  onToggleStatus: (params: { userId: string; status: AccountStatus }) => Promise<void>
  isTogglingStatus: boolean
  onDelete: () => void
}) {
  const nextStatus: AccountStatus = user.accountStatus === 'active' ? 'suspended' : 'active'

  return (
    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
      {/* Online indicator */}
      <td style={tdStyle}>
        <span
          style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: isOnline ? 'var(--color-success)' : 'var(--color-text-secondary)',
            boxShadow: isOnline ? '0 0 6px var(--color-success)' : 'none',
            transition: 'all var(--transition-normal)',
          }}
          title={isOnline ? 'En línea' : 'Desconectado'}
        />
      </td>

      {/* Name */}
      <td style={tdStyle}>
        <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
          {user.firstName} {user.lastName}
        </span>
        {isSelf && (
          <span
            style={{
              marginLeft: 'var(--space-2)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
            }}
          >
            (tú)
          </span>
        )}
      </td>

      {/* Email */}
      <td style={tdStyle}>{user.email}</td>

      {/* Role */}
      <td style={tdStyle}>
        <span
          style={{
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary-light)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-semibold)',
          }}
        >
          {USER_ROLE_LABELS[user.role]}
        </span>
      </td>

      {/* Account status */}
      <td style={tdStyle}>
        <StatusBadge status={user.accountStatus} />
      </td>

      {/* Last connection */}
      <td style={tdStyle}>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
          {user.lastSeen
            ? formatDate(user.lastSeen)
            : user.lastSignInAt
              ? formatDate(user.lastSignInAt)
              : 'Nunca'}
        </span>
      </td>

      {/* Actions */}
      <td style={tdStyle}>
        {!isSelf && (
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              type="button"
              className="btn-ghost"
              disabled={isTogglingStatus}
              onClick={() =>
                onToggleStatus({ userId: user.id, status: nextStatus })
              }
              style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--space-1) var(--space-2)' }}
            >
              {user.accountStatus === 'active' ? 'Suspender' : 'Activar'}
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={onDelete}
              style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--space-1) var(--space-2)' }}
            >
              Eliminar
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}

function StatusBadge({ status }: { status: AccountStatus }) {
  const colorMap: Record<AccountStatus, { bg: string; fg: string }> = {
    active: { bg: 'var(--color-success-light)', fg: 'var(--color-success)' },
    inactive: { bg: 'var(--color-border)', fg: 'var(--color-text-secondary)' },
    suspended: { bg: 'var(--color-warning-light)', fg: 'var(--color-warning)' },
  }
  const colors = colorMap[status]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        padding: 'var(--space-1) var(--space-2)',
        borderRadius: 'var(--radius-full)',
        backgroundColor: colors.bg,
        color: colors.fg,
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-semibold)',
      }}
    >
      ● {ACCOUNT_STATUS_LABELS[status]}
    </span>
  )
}

function InviteForm({
  onInvite,
  isInviting,
}: {
  onInvite: (payload: InviteUserPayload) => Promise<void>
  isInviting: boolean
}) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<UserRole>('doctor')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await onInvite({
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al invitar usuario')
    }
  }

  const roles: UserRole[] = ['admin', 'doctor', 'nurse', 'receptionist', 'lab_technician', 'pharmacist']

  return (
    <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
      <h3 style={{ marginBottom: 'var(--space-4)' }}>Invitar Nuevo Usuario</h3>

      {error && (
        <div
          style={{
            padding: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-danger-light)',
            color: 'var(--color-danger)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <div>
            <label htmlFor="invite-first-name" style={{ display: 'block', marginBottom: 'var(--space-1)' }}>
              Nombre
            </label>
            <input
              id="invite-first-name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="Juan"
            />
          </div>
          <div>
            <label htmlFor="invite-last-name" style={{ display: 'block', marginBottom: 'var(--space-1)' }}>
              Apellido
            </label>
            <input
              id="invite-last-name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Pérez"
            />
          </div>
          <div>
            <label htmlFor="invite-email" style={{ display: 'block', marginBottom: 'var(--space-1)' }}>
              Correo electrónico
            </label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="usuario@email.com"
            />
          </div>
          <div>
            <label htmlFor="invite-role" style={{ display: 'block', marginBottom: 'var(--space-1)' }}>
              Rol
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {USER_ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={isInviting}
          style={{ opacity: isInviting ? 0.7 : 1 }}
        >
          {isInviting ? 'Invitando...' : 'Invitar Usuario'}
        </button>
      </form>
    </div>
  )
}

function ConfirmDeleteModal({
  user,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  user: UserWithPresence
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--space-4)',
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{ maxWidth: '480px', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginBottom: 'var(--space-3)', color: 'var(--color-danger)' }}>
          Confirmar Eliminación
        </h3>
        <p style={{ marginBottom: 'var(--space-2)' }}>
          ¿Estás seguro de que deseas eliminar a{' '}
          <strong style={{ color: 'var(--color-text)' }}>
            {user.firstName} {user.lastName}
          </strong>
          ?
        </p>
        <p
          style={{
            marginBottom: 'var(--space-6)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Esta acción deshabilitará su acceso al sistema. Los datos del usuario se conservarán
          para trazabilidad de registros médicos. Esta acción no se puede deshacer fácilmente.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={isDeleting}>
            Cancelar
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}


const thStyle: React.CSSProperties = {
  padding: 'var(--space-3) var(--space-2)',
  fontWeight: 'var(--font-weight-semibold)' as React.CSSProperties['fontWeight'],
  fontSize: 'var(--font-size-xs)',
  color: 'var(--color-text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const tdStyle: React.CSSProperties = {
  padding: 'var(--space-3) var(--space-2)',
  verticalAlign: 'middle',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateStr))
}
