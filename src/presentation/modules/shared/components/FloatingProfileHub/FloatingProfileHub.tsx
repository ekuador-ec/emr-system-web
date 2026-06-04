import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import {
  MANUAL_PRESENCE_LABELS,
  PRESENCE_STATUS_LABELS,
  USER_ROLE_LABELS,
  type ManualPresenceStatus,
  type PresenceStatus,
} from "@/domain/modules/users/models/User";
import { usePresenceStore } from "@/presentation/modules/users/stores/usePresenceStore";
import { useSetManualPresence } from "@/presentation/modules/users/hooks/useSetManualPresence";
import { useThemeStore } from "@/presentation/modules/shared/stores/themeStore";
import { NotificationBell } from "@/presentation/modules/notifications/components/NotificationBell";
import { UserProfileModal } from "@/presentation/modules/users/components/UserProfileModal";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcWarning from "@/presentation/modules/shared/components/ui/webcomponents/Warnings/wcWarning";
import type { WcWarningHandle } from "@/presentation/modules/shared/components/ui/webcomponents/Warnings/wcWarning";
import {
  announceFloatingPopover,
  onFloatingPopoverOpened,
} from "@/presentation/modules/shared/utils/floatingPopoverBus";
import { useNavigate } from "react-router-dom";
import "./FloatingProfileHub.css";

const MANUAL_OPTIONS: ManualPresenceStatus[] = ["available", "busy", "invisible"];

export function FloatingProfileHub() {
  const { user, logout, isLoggingOut } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  const [isOpen, setIsOpen] = useState(false);
  const [isPresenceDropdownOpen, setIsPresenceDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const presenceWrapperRef = useRef<HTMLDivElement | null>(null);
  const warningRef = useRef<WcWarningHandle | null>(null);

  const effectiveStatus = usePresenceStore((state) => state.effectiveStatus);
  const manualStatus = usePresenceStore((state) => state.manualStatus);
  const setManualPresenceMutation = useSetManualPresence(user?.id);
  const { addToast } = useToastStore();

  useEffect(() => {
    if (!isOpen) {
      setIsPresenceDropdownOpen(false);
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isPresenceDropdownOpen) {
          setIsPresenceDropdownOpen(false);
          return;
        }
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, isPresenceDropdownOpen]);

  useEffect(() => {
    if (!isPresenceDropdownOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!presenceWrapperRef.current) return;
      if (presenceWrapperRef.current.contains(event.target as Node)) return;
      setIsPresenceDropdownOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isPresenceDropdownOpen]);

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

  const handleSelectManualStatus = async (next: ManualPresenceStatus) => {
    if (next === manualStatus || setManualPresenceMutation.isPending) {
      setIsPresenceDropdownOpen(false);
      return;
    }
    setIsPresenceDropdownOpen(false);
    try {
      await setManualPresenceMutation.mutateAsync(next);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar tu estado";
      addToast({ type: "error", message, duration: 4000 });
    }
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
              <span
                className={`floating-hub__avatar-status floating-hub__avatar-status--${effectiveStatus}`}
                aria-label={PRESENCE_STATUS_LABELS[effectiveStatus]}
                title={PRESENCE_STATUS_LABELS[effectiveStatus]}
              />
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
          <div
            className="floating-hub__menu-backdrop"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}

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

                <div
                  ref={presenceWrapperRef}
                  className={`floating-hub__status-row${isPresenceDropdownOpen ? " is-open" : ""}`}
                >
                  <button
                    type="button"
                    className={`floating-hub__status-trigger floating-hub__status-trigger--${effectiveStatus}`}
                    aria-haspopup="menu"
                    aria-expanded={isPresenceDropdownOpen}
                    aria-label={`Cambiar estado: actualmente ${PRESENCE_STATUS_LABELS[effectiveStatus]}`}
                    onClick={() => setIsPresenceDropdownOpen((value) => !value)}
                    disabled={setManualPresenceMutation.isPending}
                  >
                    <span className="floating-hub__status-trigger-bullet" aria-hidden="true">
                      <span className="floating-hub__status-trigger-dot" />
                    </span>
                    <span className="floating-hub__status-trigger-label">
                      {PRESENCE_STATUS_LABELS[effectiveStatus]}
                    </span>
                    <span className="floating-hub__status-trigger-chevron" aria-hidden="true">
                      <Icon name="icon-chevron-down" size={10} />
                    </span>
                  </button>

                  <span
                    className="floating-hub__status-info"
                    role="img"
                    aria-label="El estado Ausente se activa automaticamente tras un periodo sin actividad."
                    tabIndex={0}
                  >
                    <Icon name="icon-info-circle" size={12} />
                    <span className="floating-hub__status-tooltip" role="tooltip">
                      El estado <strong>Ausente</strong> se activa automaticamente
                      tras un periodo sin actividad.
                    </span>
                  </span>

                  {isPresenceDropdownOpen && (
                    <div
                      className="floating-hub__status-dropdown"
                      role="menu"
                      aria-label="Selecciona tu estado de conexion"
                    >
                      {MANUAL_OPTIONS.map((option) => {
                        const optionEffective: PresenceStatus =
                          option === "available"
                            ? "online"
                            : option === "busy"
                              ? "busy"
                              : "offline";
                        const isSelected = manualStatus === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            role="menuitemradio"
                            aria-checked={isSelected}
                            className={`floating-hub__status-option${isSelected ? " is-selected" : ""}`}
                            onClick={() => void handleSelectManualStatus(option)}
                            disabled={setManualPresenceMutation.isPending}
                          >
                            <span
                              className={`floating-hub__status-option-dot floating-hub__status-option-dot--${optionEffective}`}
                              aria-hidden="true"
                            />
                            <span className="floating-hub__status-option-label">
                              {MANUAL_PRESENCE_LABELS[option]}
                            </span>
                            {isSelected && (
                              <span
                                className="floating-hub__status-option-check"
                                aria-hidden="true"
                              >
                                <Icon name="icon-check" size={10} />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
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
