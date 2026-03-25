import { useState } from "react";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import { useAdminUsers } from "@/presentation/modules/users/hooks/useAdminUsers";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import type {
  AccountStatus,
  UserWithPresence,
} from "@/domain/modules/users/models/User";
import { USER_ROLE_LABELS, ACCOUNT_STATUS_LABELS } from "@/domain/modules/users/models/User";
import { InviteUserModal } from "@/presentation/modules/users/components/InviteUserModal";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { useUserStore } from "@/presentation/modules/users/stores/useUserStore";
import "@/presentation/modules/shared/components/ui/webcomponents/wcButton";
import "@/presentation/modules/shared/components/ui/webcomponents/wcTabs";

export function UsersManagementPage() {
  const { user: currentUser } = useAuth();
  const {
    activeUsers,
    deletedUsers,
    isLoading,
    isActivated,
    loadUsers,
    inviteUser,
    isInviting,
    toggleUserStatus,
    isTogglingStatus,
    softDeleteUser,
    isSoftDeleting,
  } = useAdminUsers();

  const { addToast } = useToastStore();

  const { isInviteModalOpen, setInviteModalOpen } = useUserStore();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);



  const handleToggleStatus = async (params: { userId: string; status: AccountStatus }) => {
    await toggleUserStatus(params);
    const label = params.status === "suspended" ? "suspendida" : "activada";
    addToast({ type: "success", message: `Cuenta ${label} exitosamente` });
  };

  const handleDelete = async (userId: string) => {
    await softDeleteUser(userId);
    setDeleteConfirmId(null);
    addToast({ type: "success", message: "Usuario eliminado exitosamente" });
  };

  if (!isActivated) {
    return (
      <div style={{ padding: "var(--space-8)", maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-6)",
            flexWrap: "wrap",
            gap: "var(--space-3)",
          }}
        >
          <div>
            <h1 style={{ marginBottom: "var(--space-1)" }}>Gestion de Usuarios</h1>
            <p style={{ fontSize: "var(--font-size-sm)" }}>Administra los usuarios del sistema</p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setInviteModalOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}
          >
            <Icon name="icon-user-plus" size={20} />
            Invitar Usuario
          </button>
        </div>

        <InviteUserModal
          isOpen={isInviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          onInvite={async (payload) => {
            await inviteUser(payload)
            if (!isActivated) loadUsers();
          }}
          isInviting={isInviting}
        />

        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-4)",
            padding: "var(--space-16) var(--space-8)",
            textAlign: "center",
            minHeight: "360px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--color-primary-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "var(--space-2)",
            }}
          >
            <Icon name="icon-users" size={32} />
          </div>
          <h3 style={{ margin: 0 }}>Lista de usuarios</h3>
          <p
            style={{
              maxWidth: "400px",
              fontSize: "var(--font-size-sm)",
              lineHeight: "1.5",
              margin: 0,
            }}
          >
            Haz clic en el boton para consultar y visualizar todos los usuarios registrados en el
            sistema.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={loadUsers}
            disabled={isLoading}
            style={{
              marginTop: "var(--space-2)",
              padding: "var(--space-3) var(--space-6)",
              fontSize: "var(--font-size-base)",
              gap: "var(--space-2)",
            }}
          >
            <Icon name="icon-users" size={18} />
            {isLoading ? "Cargando..." : "Cargar Usuarios"}
          </button>
        </div>
      </div>
    );
  }

  const allUsers = [...activeUsers, ...deletedUsers];

  return (
    <div style={{ padding: "var(--space-8)", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-6)",
          flexWrap: "wrap",
          gap: "var(--space-3)",
        }}
      >
        <div>
          <h1 style={{ marginBottom: "var(--space-1)" }}>Gestion de Usuarios</h1>
          <p style={{ fontSize: "var(--font-size-sm)" }}>
            {activeUsers.length} usuarios activos · {deletedUsers.length} eliminados
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setInviteModalOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}
        >
          <Icon name="icon-user-plus" size={20} />
          Invitar Usuario
        </button>
      </div>

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInvite={async (payload) => {
          await inviteUser(payload)
        }}
        isInviting={isInviting}
      />

       <wc-tabs>
        <wc-button variant="tab" slot="tab">
          <Icon name="icon-users" size={16} />
          Activos ({activeUsers.length})
        </wc-button>
        <wc-button variant="tab" slot="tab">
          <Icon name="icon-trash" size={16} />
          Eliminados ({deletedUsers.length})
        </wc-button>

        <div slot="panel">
          <div className="card" style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "var(--font-size-sm)",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid var(--color-border)",
                    textAlign: "left",
                  }}
                >
                  <th style={thStyle}>Nombre</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Rol</th>
                  <th style={thStyle}>Cuenta</th>
                  <th style={thStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {activeUsers.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    isSelf={u.id === currentUser?.id}
                    onToggleStatus={handleToggleStatus}
                    isTogglingStatus={isTogglingStatus}
                    onDelete={() => setDeleteConfirmId(u.id)}
                  />
                ))}
                {activeUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        ...tdStyle,
                        textAlign: "center",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      No hay usuarios registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div slot="panel">
          <div className="card" style={{ overflowX: "auto" }}>
            {deletedUsers.length > 0 ? (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "var(--font-size-sm)",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--color-border)", textAlign: "left" }}>
                    <th style={thStyle}>Nombre</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Rol</th>
                    <th style={thStyle}>Eliminado el</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <td style={tdStyle}>
                        {u.firstName} {u.lastName}
                      </td>
                      <td style={tdStyle}>{u.email}</td>
                      <td style={tdStyle}>{USER_ROLE_LABELS[u.role]}</td>
                      <td style={tdStyle}>{formatDate(u.deletedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "var(--space-12) var(--space-4)",
                  color: "var(--color-text-secondary)",
                  gap: "var(--space-2)",
                }}
              >
                <Icon name="icon-check" size={28} />
                <p style={{ margin: 0, fontSize: "var(--font-size-sm)" }}>
                  No hay usuarios eliminados
                </p>
              </div>
            )}
          </div>
        </div>
      </wc-tabs>

      {deleteConfirmId && (
        <ConfirmDeleteModal
          user={allUsers.find((u) => u.id === deleteConfirmId)!}
          onConfirm={() => handleDelete(deleteConfirmId)}
          onCancel={() => setDeleteConfirmId(null)}
          isDeleting={isSoftDeleting}
        />
      )}
    </div>
  );
}

function UserRow({
  user,
  isSelf,
  onToggleStatus,
  isTogglingStatus,
  onDelete,
}: {
  user: UserWithPresence;
  isSelf: boolean;
  onToggleStatus: (params: { userId: string; status: AccountStatus }) => Promise<void>;
  isTogglingStatus: boolean;
  onDelete: () => void;
}) {
  const nextStatus: AccountStatus = user.accountStatus === "active" ? "suspended" : "active";

  return (
    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
      <td style={tdStyle}>
        <span style={{ fontWeight: "var(--font-weight-medium)" }}>
          {user.firstName} {user.lastName}
        </span>
        {isSelf && (
          <span
            style={{
              marginLeft: "var(--space-2)",
              fontSize: "var(--font-size-xs)",
              color: "var(--color-text-secondary)",
            }}
          >
            (tu)
          </span>
        )}
      </td>

      <td style={tdStyle}>{user.email}</td>

      <td style={tdStyle}>
        <span
          style={{
            padding: "var(--space-1) var(--space-2)",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--color-primary-light)",
            fontSize: "var(--font-size-xs)",
            fontWeight: "var(--font-weight-semibold)",
          }}
        >
          {USER_ROLE_LABELS[user.role]}
        </span>
      </td>

      <td style={tdStyle}>
        <StatusBadge status={user.accountStatus} />
      </td>

      <td style={tdStyle}>
        {!isSelf && (
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <button
              type="button"
              className="btn-ghost"
              disabled={isTogglingStatus}
              onClick={() => onToggleStatus({ userId: user.id, status: nextStatus })}
              style={{ fontSize: "var(--font-size-xs)", padding: "var(--space-1) var(--space-2)" }}
            >
              {user.accountStatus === "active" ? "Suspender" : "Activar"}
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={onDelete}
              style={{ fontSize: "var(--font-size-xs)", padding: "var(--space-1) var(--space-2)" }}
            >
              Eliminar
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: AccountStatus }) {
  const colorMap: Record<AccountStatus, { bg: string; fg: string }> = {
    active: { bg: "var(--color-success-light)", fg: "var(--color-success)" },
    inactive: { bg: "var(--color-border)", fg: "var(--color-text-secondary)" },
    suspended: { bg: "var(--color-warning-light)", fg: "var(--color-warning)" },
  };
  const colors = colorMap[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-1)",
        padding: "var(--space-1) var(--space-2)",
        borderRadius: "var(--radius-full)",
        backgroundColor: colors.bg,
        color: colors.fg,
        fontSize: "var(--font-size-xs)",
        fontWeight: "var(--font-weight-semibold)",
      }}
    >
      {ACCOUNT_STATUS_LABELS[status]}
    </span>
  );
}


function ConfirmDeleteModal({
  user,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  user: UserWithPresence;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "var(--space-4)",
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{ maxWidth: "480px", width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginBottom: "var(--space-3)", color: "var(--color-danger)" }}>
          Confirmar Eliminacion
        </h3>
        <p style={{ marginBottom: "var(--space-2)" }}>
          Estas seguro de que deseas eliminar a{" "}
          <strong style={{ color: "var(--color-text)" }}>
            {user.firstName} {user.lastName}
          </strong>
          ?
        </p>
        <p
          style={{
            marginBottom: "var(--space-6)",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-secondary)",
          }}
        >
          Esta accion deshabilitara su acceso al sistema. Los datos del usuario se conservaran para
          trazabilidad de registros medicos. Esta accion no se puede deshacer facilmente.
        </p>
        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={isDeleting}>
            Cancelar
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Eliminando..." : "Si, Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "var(--space-3) var(--space-2)",
  fontWeight: "var(--font-weight-semibold)" as React.CSSProperties["fontWeight"],
  fontSize: "var(--font-size-xs)",
  color: "var(--color-text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const tdStyle: React.CSSProperties = {
  padding: "var(--space-3) var(--space-2)",
  verticalAlign: "middle",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "--";
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateStr));
}
