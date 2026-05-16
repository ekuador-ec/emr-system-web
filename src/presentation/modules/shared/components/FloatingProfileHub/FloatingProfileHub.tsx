import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import { USER_ROLE_LABELS } from "@/domain/modules/users/models/User";
import { useThemeStore } from "@/presentation/modules/shared/stores/themeStore";
import { NotificationBell } from "@/presentation/modules/notifications/components/NotificationBell";
import { UserProfileModal } from "@/presentation/modules/users/components/UserProfileModal";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcWarning from "@/presentation/modules/shared/components/ui/webcomponents/Warnings/wcWarning";
import type { WcWarningHandle } from "@/presentation/modules/shared/components/ui/webcomponents/Warnings/wcWarning";
import {
  announceFloatingPopover,
  onFloatingPopoverOpened,
} from "@/presentation/modules/shared/utils/floatingPopoverBus";
import { useNavigate } from "react-router-dom";
import "./FloatingProfileHub.css";

export function FloatingProfileHub() {
  const { user, logout, isLoggingOut } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const warningRef = useRef<WcWarningHandle | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  useEffect(() => {
    return onFloatingPopoverOpened("profile", () => setIsOpen(false));
  }, []);

  if (!user) return null;

  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.email || "";
  const avatarInitial = (user.firstName?.charAt(0) || user.email?.charAt(0) || "").toUpperCase();
  const roleLabel = USER_ROLE_LABELS[user.role] || user.role;

  const handleOpenProfile = () => {
    setIsOpen(false);
    setIsProfileModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsOpen(false);
    warningRef.current?.open(async () => {
      await logout();
      navigate("/login");
    });
  };

  return (
    <>
      <div ref={wrapperRef} className="floating-hub">
        <div className="floating-hub__cluster">
          <NotificationBell
            userId={user.id}
            onOpenChange={(open) => {
              if (open) setIsOpen(false);
            }}
          />

          <button
            type="button"
            className="floating-hub__trigger"
            onClick={() =>
              setIsOpen((value) => {
                const next = !value;
                if (next) announceFloatingPopover("profile");
                return next;
              })
            }
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-label={`Menú de ${displayName}`}
          >
            <span className="floating-hub__avatar">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="floating-hub__avatar-img" />
              ) : (
                <span className="floating-hub__avatar-fallback">{avatarInitial}</span>
              )}
              <span className="floating-hub__avatar-status" aria-hidden="true" />
            </span>
            <span
              className={`floating-hub__chevron${isOpen ? " is-open" : ""}`}
              aria-hidden="true"
            >
              <Icon name="icon-chevron-down" size={12} />
            </span>
          </button>
        </div>

        {isOpen && (
          <div className="floating-hub__menu" role="menu">
            <div className="floating-hub__menu-header">
              <span className="floating-hub__menu-header-avatar">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="floating-hub__menu-header-avatar-img"
                  />
                ) : (
                  <span className="floating-hub__menu-header-avatar-fallback">
                    {avatarInitial}
                  </span>
                )}
              </span>

              <div className="floating-hub__menu-header-info">
                <span className="floating-hub__menu-name">
                  <span className="floating-hub__menu-name-icon" aria-hidden="true">
                    <Icon name="icon-card-info" size={11} />
                  </span>
                  {displayName}
                </span>
                <span className="floating-hub__menu-role">
                  <span className="floating-hub__menu-role-icon" aria-hidden="true">
                    <Icon name="icon-settings-cog-solid" size={11} />
                  </span>
                  {roleLabel}
                </span>
                <span className="floating-hub__menu-status">
                  <span className="floating-hub__menu-status-bullet" aria-hidden="true">
                    <span className="floating-hub__menu-status-dot" />
                  </span>
                  En línea
                </span>
              </div>
            </div>

            <button
              type="button"
              role="menuitem"
              className="floating-hub__menu-item"
              onClick={toggleTheme}
            >
              <span className="floating-hub__menu-item-icon" aria-hidden="true">
                <Icon name={isDark ? "icon-sun" : "icon-moon"} size={14} />
              </span>
              <span>{isDark ? "Modo claro" : "Modo oscuro"}</span>
            </button>

            <button
              type="button"
              role="menuitem"
              className="floating-hub__menu-item"
              onClick={handleOpenProfile}
            >
              <span className="floating-hub__menu-item-icon" aria-hidden="true">
                <Icon name="icon-user-solid" size={14} />
              </span>
              <span>Ver perfil</span>
            </button>

            <button
              type="button"
              role="menuitem"
              className="floating-hub__menu-item floating-hub__menu-item--danger"
              onClick={handleConfirmLogout}
              disabled={isLoggingOut}
            >
              <span
                className="floating-hub__menu-item-icon floating-hub__menu-item-icon--danger"
                aria-hidden="true"
              >
                <Icon name="icon-logout" size={14} />
              </span>
              <span>{isLoggingOut ? "Saliendo..." : "Cerrar sesión"}</span>
            </button>
          </div>
        )}
      </div>

      <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />

      <WcWarning
        ref={warningRef}
        title="Cerrar sesión"
        message="¿Estás seguro de que deseas cerrar tu sesión actual?"
        confirmText={
          <span className="floating-hub__warning-action">
            <Icon name="icon-logout" size={16} />
            Cerrar sesión
          </span>
        }
        cancelText={
          <span className="floating-hub__warning-action">
            <Icon name="icon-x" size={16} />
            Cancelar
          </span>
        }
        type="destructive"
      />
    </>
  );
}
