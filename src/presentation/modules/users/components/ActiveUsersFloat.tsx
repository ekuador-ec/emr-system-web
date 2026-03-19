import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePresenceSubscription } from "@/presentation/modules/users/hooks/usePresenceSubscription";
import { SupabaseUserRepository } from "@/infrastructure/modules/users/repositories/SupabaseUserRepository";
import type { UserWithPresence } from "@/domain/modules/users/models/User";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";

export const ADMIN_FLOAT_QUERY_KEY = ["admin", "users", "float"] as const;

const userRepository = new SupabaseUserRepository();

export function ActiveUsersFloat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: allUsers } = useQuery({
    queryKey: ADMIN_FLOAT_QUERY_KEY,
    queryFn: () => userRepository.getAllUsers(),
    enabled: user?.role === "admin",
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });

  usePresenceSubscription(user?.role === "admin");

  if (user?.role !== "admin") return null;

  const onlineUsers = (allUsers ?? []).filter((u) => u.isOnline && !u.deletedAt);
  const onlineCount = onlineUsers.length;

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={panelRef} className="active-users-float-container">
      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "64px",
            right: 0,
            width: "320px",
            maxHeight: "400px",
            overflowY: "auto",
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-lg)",
            border: "1px solid var(--color-border)",
            animation: "floatPanelIn 200ms ease",
          }}
        >
          <div
            style={{
              padding: "var(--space-4)",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h4 style={{ margin: 0, fontSize: "var(--font-size-sm)" }}>
              Usuarios en linea ({onlineCount})
            </h4>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setIsOpen(false)}
              style={{ padding: "var(--space-1)", lineHeight: 1 }}
            >
              <Icon name="icon-x" size={16} />
            </button>
          </div>

          <div style={{ padding: "var(--space-2)" }}>
            {onlineUsers.length > 0 ? (
              onlineUsers.map((user) => <OnlineUserItem key={user.id} user={user} />)
            ) : (
              <div
                style={{
                  padding: "var(--space-6) var(--space-4)",
                  textAlign: "center",
                  color: "var(--color-text-secondary)",
                }}
              >
                <p style={{ margin: 0, fontSize: "var(--font-size-sm)" }}>
                  No hay usuarios en linea
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "var(--radius-full)",
          backgroundColor: onlineCount > 0 ? "var(--color-success)" : "var(--color-text-secondary)",
          color: "#ffffff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow-lg)",
          transition: "transform var(--transition-fast), box-shadow var(--transition-fast)",
          position: "relative",
          padding: 0,
        }}
        title="Usuarios en linea"
      >
        <Icon name="icon-users" size={22} />

        {onlineCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              minWidth: "20px",
              height: "20px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--color-danger)",
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: "var(--font-weight-bold)" as React.CSSProperties["fontWeight"],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              border: "2px solid var(--color-surface)",
            }}
          >
            {onlineCount}
          </span>
        )}
      </button>

      <style>
        {`
          .active-users-float-container {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 900;
          }

          @media (max-width: 768px) {
            .active-users-float-container {
              bottom: 96px; /* Posicionado arriba del botón del menú móvil */
            }
          }

          @keyframes floatPanelIn {
            from {
              opacity: 0;
              transform: translateY(8px) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </div>
  );
}

function OnlineUserItem({ user }: { user: UserWithPresence }) {
  const initials = `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-3)",
        borderRadius: "var(--radius-lg)",
        transition: "background-color var(--transition-fast)",
        cursor: "default",
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={`${user.firstName} ${user.lastName}`}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "var(--radius-full)",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--color-primary-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-semibold)" as React.CSSProperties["fontWeight"],
              color: "var(--color-text)",
            }}
          >
            {initials}
          </div>
        )}
        <span
          style={{
            position: "absolute",
            bottom: "0px",
            right: "0px",
            width: "10px",
            height: "10px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--color-success)",
            border: "2px solid var(--color-surface)",
            boxShadow: "0 0 4px var(--color-success)",
          }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)" as React.CSSProperties["fontWeight"],
            color: "var(--color-text)",
            lineHeight: "1.3",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {user.firstName} {user.lastName}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-secondary)",
            lineHeight: "1.3",
          }}
        >
          {user.lastSeen ? formatLastSeen(user.lastSeen) : "Conectado ahora"}
        </p>
      </div>
    </div>
  );
}

function formatLastSeen(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Ahora mismo";
  if (diffMin < 60) return `Hace ${diffMin} min`;

  return new Intl.DateTimeFormat("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
