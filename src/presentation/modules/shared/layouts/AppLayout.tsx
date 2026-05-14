import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import { USER_ROLE_LABELS } from "@/domain/modules/users/models/User";
import { usePresenceTracker } from "@/presentation/modules/users/hooks/usePresenceTracker";
import { useUserStore } from "@/presentation/modules/users/stores/useUserStore";
import { useAdminUsers } from "@/presentation/modules/users/hooks/useAdminUsers";
import { InviteUserModal } from "@/presentation/modules/users/components/InviteUserModal";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/presentation/modules/shared/components/ThemeToggle";
import { UserProfileModal } from "@/presentation/modules/users/components/UserProfileModal";
import { Toaster } from "@/presentation/modules/shared/components/Toaster";
import { Sidebar } from "@/presentation/modules/shared/components/Sidebar";
import { NotificationBell } from "@/presentation/modules/notifications/components/NotificationBell";
import { ActiveUsersFloat } from "@/presentation/modules/users/components/ActiveUsersFloat";
import { useNotificationSubscription } from "@/presentation/modules/notifications/hooks/useNotificationSubscription";
import { usePatientSubscription } from "@/presentation/modules/patient/hooks/usePatientSubscription";
import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import { PatientCreateModal } from "@/presentation/modules/patient/components/Patients/PatientCreateModal";
import { PatientQuickSearchModal } from "@/presentation/modules/patient/components/Patients/PatientQuickSearchModal";
import { QuickActionBar } from "@/presentation/modules/shared/components/QuickActionBar";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcWarning from "@/presentation/modules/shared/components/ui/webcomponents/Warnings/wcWarning";
import type { WcWarningHandle } from "@/presentation/modules/shared/components/ui/webcomponents/Warnings/wcWarning";
import "./AppLayout.css";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoggingOut } = useAuth();
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const warningRef = useRef<WcWarningHandle | null>(null);

  const { setInviteModalOpen, isInviteModalOpen } = useUserStore();
  // Safe to use here because it's a hook wrapping react-query; calling loadUsers will fetch data
  // and populate cache, making the management page automatically activate upon navigation.
  const { loadUsers, inviteUser, isInviting, isActivated: isUsersLoaded } = useAdminUsers();

  const {
    isCreateModalOpen,
    setCreateModalOpen,
    editingPatientId,
    setEditingPatientId,
    isQuickSearchModalOpen,
    setQuickSearchModalOpen,
    onCreateSuccess,
    setCreateSuccessHandler,
  } = usePatientStore();

  usePresenceTracker(user?.id);
  useNotificationSubscription(user?.id);
  usePatientSubscription();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const confirmLogout = () => {
    warningRef.current?.open(handleLogout);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "row" }}>
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "60px",
            padding: "var(--space-3) var(--space-6)",
            backgroundColor: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
            transition: "background-color var(--transition-normal)",
            gap: "var(--space-4)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)" }}>
            <nav style={{ display: "flex", gap: "var(--space-1)" }}></nav>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            {user && (
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "4px 16px 4px 4px",
                  borderRadius: "100px",
                  cursor: "pointer",
                  border:
                    "1px solid color-mix(in srgb, var(--color-primary-light) 60%, transparent)",
                  background: "var(--color-surface)",
                  boxShadow:
                    "0 2px 10px -2px rgba(0, 0, 0, 0.04), 0 4px 6px -4px rgba(0, 0, 0, 0.02)",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 16px -4px rgba(0, 0, 0, 0.08), 0 4px 8px -4px rgba(0, 0, 0, 0.04)";
                  e.currentTarget.style.background =
                    "color-mix(in srgb, var(--color-surface) 96%, var(--color-primary) 4%)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 10px -2px rgba(0, 0, 0, 0.04), 0 4px 6px -4px rgba(0, 0, 0, 0.02)";
                  e.currentTarget.style.background = "var(--color-surface)";
                }}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      boxShadow:
                        "0 0 0 1px color-mix(in srgb, var(--color-border) 40%, transparent)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-primary-light)",
                      color: "var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "700",
                      fontSize: "1.1rem",
                      boxShadow:
                        "0 0 0 1px color-mix(in srgb, var(--color-border) 40%, transparent)",
                    }}
                  >
                    {user.firstName?.charAt(0) || user.email.charAt(0)}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "1px",
                    marginLeft: "2px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: "700",
                      color: "var(--color-text)",
                      lineHeight: "1",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.firstName || user.email}
                  </span>
                  <span
                    style={{
                      fontSize: "0.5rem",
                      // fontWeight: "800",
                      color: "var(--color-primary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      backgroundColor: "var(--color-primary-light)",
                      marginTop: "4px",
                      padding: "5px 8px ",
                      borderRadius: "4px",
                      lineHeight: "1.2",
                    }}
                  >
                    {USER_ROLE_LABELS[user.role] || user.role}
                  </span>
                </div>
              </button>
            )}
            <NotificationBell userId={user?.id} />
            <ThemeToggle />
            <WcButtonIcon
              variant="danger"
              shape="circle"
              icon="icon-logout"
              onClick={confirmLogout}
              disabled={isLoggingOut}
              title={isLoggingOut ? "Saliendo..." : "Cerrar sesión"}
              aria-label="Cerrar sesión"
            />
          </div>
        </header>

        {/* Sub-header / Quick Actions */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            padding: "var(--space-2) var(--space-6)",
            backgroundColor: "var(--color-bg-secondary)",
            borderBottom: "1px solid var(--color-border)",
            gap: "var(--space-2)",
          }}
          title="Acciones Rápidas"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              color: "var(--color-text-secondary)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-medium)",
              whiteSpace: "nowrap",
              marginRight: "var(--space-4)",
            }}
          >
            <span style={{ display: "inline-block" }} className="quick-actions-title">
              Acciones Rápidas:
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <QuickActionBar
              module="Pacientes"
              icon="icon-patient"
              actions={[
                {
                  label: "Buscar Paciente",
                  icon: "icon-search",
                  onClick: () => setQuickSearchModalOpen(true),
                },
                {
                  label: "Registrar Nuevo",
                  icon: "icon-user-plus",
                  onClick: () => {
                    setCreateSuccessHandler(null);
                    setCreateModalOpen(true);
                  },
                },
              ]}
            />

            <QuickActionBar
              module="Usuarios"
              icon="icon-users"
              actions={[
                {
                  label: "Cargar usuarios",
                  icon: "icon-users",
                  onClick: () => {
                    loadUsers();
                    navigate("/admin/users");
                  },
                },
                {
                  label: "Invitar Usuario",
                  icon: "icon-user-plus",
                  onClick: () => {
                    setInviteModalOpen(true);
                  },
                },
              ]}
            />

            <QuickActionBar
              module="Historias Clínicas"
              icon="icon-clinical-history"
              actions={[]}
              disabled={true}
            />

            <QuickActionBar
              module="Evoluciones Médicas"
              icon="icon-medical-evolution"
              actions={[]}
              disabled={true}
            />
          </div>
        </div>

        {/* Main content */}
        <main style={{ flex: 1, padding: "var(--space-6)", overflowY: "auto" }}>{children}</main>
      </div>

      {/* Global Elements */}
      <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <ActiveUsersFloat />
      <Toaster />

      {/* Global Modals */}
      {isCreateModalOpen && (
        <PatientCreateModal
          patientId={editingPatientId}
          onClose={() => {
            setCreateModalOpen(false);
            setEditingPatientId(null);
            setCreateSuccessHandler(null);
          }}
          onCreated={onCreateSuccess ?? undefined}
        />
      )}

      <PatientQuickSearchModal
        isOpen={isQuickSearchModalOpen}
        onClose={() => setQuickSearchModalOpen(false)}
      />

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInvite={async (payload) => {
          await inviteUser(payload);
          // If the table was never loaded but we invite, we load it so if they navigate it's there
          if (!isUsersLoaded) loadUsers();
        }}
        isInviting={isInviting}
      />

      <WcWarning
        ref={warningRef}
        title="Cerrar sesión"
        message="¿Estás seguro de que deseas cerrar tu sesión actual?"
        confirmText={
          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <Icon name="icon-logout" size={16} />
            Cerrar sesión
          </span>
        }
        cancelText={
          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <Icon name="icon-x" size={16} />
            Cancelar
          </span>
        }
        type="destructive"
      />
    </div>
  );
}
