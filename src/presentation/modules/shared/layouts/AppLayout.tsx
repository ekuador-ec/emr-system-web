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

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.email || "";

  const avatarInitial = (user?.firstName?.charAt(0) || user?.email?.charAt(0) || "").toUpperCase();

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-main-column">
        <header className="app-header">
          <div className="app-header-left">
            <nav className="app-header-nav" />
          </div>

          <div className="app-header-right">
            {user && (
              <button
                type="button"
                className="app-header-profile-btn"
                onClick={() => setIsProfileModalOpen(true)}
                aria-label={`Ver perfil de ${displayName}`}
              >
                <span className="app-header-profile-avatar">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="app-header-profile-avatar-img"
                    />
                  ) : (
                    <span className="app-header-profile-avatar-fallback">{avatarInitial}</span>
                  )}
                  <span className="app-header-profile-status" aria-hidden="true" />
                </span>

                <span className="app-header-profile-info">
                  <span className="app-header-profile-name">{displayName}</span>
                  <span className="app-header-profile-role">
                    {USER_ROLE_LABELS[user.role] || user.role}
                  </span>
                </span>
              </button>
            )}
            <span className="app-header-divider" aria-hidden="true" />
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

        <div className="app-subheader" title="Acciones Rápidas">
          <span className="app-subheader-label">Acciones Rápidas:</span>

          <div className="app-subheader-actions">
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

        <main className="app-main-content">{children}</main>
      </div>

      <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <ActiveUsersFloat />
      <Toaster />

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
          if (!isUsersLoaded) loadUsers();
        }}
        isInviting={isInviting}
      />

      <WcWarning
        ref={warningRef}
        title="Cerrar sesión"
        message="¿Estás seguro de que deseas cerrar tu sesión actual?"
        confirmText={
          <span className="app-warning-action">
            <Icon name="icon-logout" size={16} />
            Cerrar sesión
          </span>
        }
        cancelText={
          <span className="app-warning-action">
            <Icon name="icon-x" size={16} />
            Cancelar
          </span>
        }
        type="destructive"
      />
    </div>
  );
}
