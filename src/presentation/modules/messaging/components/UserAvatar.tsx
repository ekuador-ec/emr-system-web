import type { PresenceStatus } from "@/domain/modules/users/models/User";
import { PRESENCE_STATUS_LABELS } from "@/domain/modules/users/models/User";
import { userInitials } from "@/presentation/modules/messaging/utils/formatMessageTime";

interface UserAvatarProps {
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  presenceStatus?: PresenceStatus;
  size?: "sm" | "md" | "lg";
  showStatusDot?: boolean;
  placeholder?: boolean;
}

export function UserAvatar({
  firstName,
  lastName,
  avatarUrl,
  presenceStatus = "offline",
  size = "md",
  showStatusDot = true,
  placeholder = false,
}: UserAvatarProps) {
  const initials = userInitials(firstName, lastName);
  const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim() || "Usuario";
  const showDot = showStatusDot && presenceStatus !== "offline";

  return (
    <div className={`msg-avatar ${size}${placeholder ? " placeholder" : ""}`}>
      {avatarUrl ? (
        <img className="msg-avatar-img" src={avatarUrl} alt={fullName} />
      ) : (
        <div className="msg-avatar-fallback" aria-label={fullName}>
          {initials}
        </div>
      )}
      {showDot && (
        <span
          className={`msg-avatar-dot msg-avatar-dot--${presenceStatus}`}
          aria-label={PRESENCE_STATUS_LABELS[presenceStatus]}
          title={PRESENCE_STATUS_LABELS[presenceStatus]}
        />
      )}
    </div>
  );
}
