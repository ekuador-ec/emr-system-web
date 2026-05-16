import { userInitials } from "@/presentation/modules/messaging/utils/formatMessageTime";

interface UserAvatarProps {
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  isOnline?: boolean;
  size?: "sm" | "md" | "lg";
  showStatusDot?: boolean;
  placeholder?: boolean;
}

export function UserAvatar({
  firstName,
  lastName,
  avatarUrl,
  isOnline = false,
  size = "md",
  showStatusDot = true,
  placeholder = false,
}: UserAvatarProps) {
  const initials = userInitials(firstName, lastName);
  const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim() || "Usuario";

  return (
    <div className={`msg-avatar ${size}${placeholder ? " placeholder" : ""}`}>
      {avatarUrl ? (
        <img className="msg-avatar-img" src={avatarUrl} alt={fullName} />
      ) : (
        <div className="msg-avatar-fallback" aria-label={fullName}>
          {initials}
        </div>
      )}
      {showStatusDot && isOnline && <span className="msg-avatar-dot" aria-hidden="true" />}
    </div>
  );
}
