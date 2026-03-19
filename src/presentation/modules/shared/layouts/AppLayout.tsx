import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import { usePresenceTracker } from "@/presentation/modules/users/hooks/usePresenceTracker";
import { useState, useRef, useEffect } from "react";
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
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoggingOut } = useAuth();
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPatientMenuOpen, setIsPatientMenuOpen] = useState(false);
  const patientMenuRef = useRef<HTMLDivElement>(null);

  const {
    isCreateModalOpen,
    setCreateModalOpen,
    editingPatientId,
    setEditingPatientId,
    isQuickSearchModalOpen,
    setQuickSearchModalOpen,
  } = usePatientStore();

  usePresenceTracker(user?.id);
  useNotificationSubscription(user?.id);
  usePatientSubscription();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (patientMenuRef.current && !patientMenuRef.current.contains(event.target as Node)) {
        setIsPatientMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
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
                className="btn-ghost"
                onClick={() => setIsProfileModalOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  padding: "var(--space-1) var(--space-2)",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  border: "none",
                  background: "transparent",
                }}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-primary-light)",
                      color: "var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                    }}
                  >
                    {user.firstName?.charAt(0) || user.email.charAt(0)}
                  </div>
                )}
                <span
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {user.firstName || user.email}
                </span>
              </button>
            )}
            <NotificationBell userId={user?.id} />
            <ThemeToggle />
            <button
              type="button"
              className="btn-ghost"
              onClick={handleLogout}
              disabled={isLoggingOut}
              style={{ fontSize: "var(--font-size-sm)" }}
            >
              {isLoggingOut ? "Saliendo..." : "Cerrar sesión"}
            </button>
          </div>
        </header>

        {/* Sub-header / Quick Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "var(--space-2) var(--space-6)",
            backgroundColor: "var(--color-bg-secondary)",
            borderBottom: "1px solid var(--color-border)",
            gap: "var(--space-4)",
          }}
        >
          <div style={{ position: "relative" }} ref={patientMenuRef}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setIsPatientMenuOpen(!isPatientMenuOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              <Icon name="icon-users" size={16} />
              Pacientes
              <div style={{ marginLeft: "var(--space-1)", display: "flex" }}>
                <Icon name="icon-chevron-down" size={14} />
              </div>
            </button>

            {isPatientMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: "var(--space-1)",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-md)",
                  minWidth: "200px",
                  zIndex: 50,
                  display: "flex",
                  flexDirection: "column",
                  padding: "var(--space-1) 0",
                }}
              >
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setQuickSearchModalOpen(true);
                    setIsPatientMenuOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    width: "100%",
                    justifyContent: "flex-start",
                    padding: "var(--space-2) var(--space-4)",
                    borderRadius: 0,
                    color: "var(--color-text-primary)",
                  }}
                >
                  <Icon name="icon-search" size={16} />
                  Buscar Paciente
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setCreateModalOpen(true);
                    setIsPatientMenuOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    width: "100%",
                    justifyContent: "flex-start",
                    padding: "var(--space-2) var(--space-4)",
                    borderRadius: 0,
                    color: "var(--color-text-primary)",
                  }}
                >
                  <Icon name="icon-user-plus" size={16} />
                  Registrar Nuevo
                </button>
              </div>
            )}
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
          }}
        />
      )}
      
      <PatientQuickSearchModal 
        isOpen={isQuickSearchModalOpen}
        onClose={() => setQuickSearchModalOpen(false)}
      />
    </div>
  );
}
