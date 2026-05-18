import type { UserRole } from "@/domain/modules/users/models/User";
import type { MessagingContact } from "@/domain/modules/messaging/models/Conversation";
import { toPresenceStatus } from "@/infrastructure/modules/users/mappers/profileMapper";

export interface ContactRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  avatar_url: string | null;
  is_online: boolean | null;
  last_seen: string | null;
  presence_status: string | null;
}

export function mapContactRow(row: ContactRow): MessagingContact {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    role: (row.role ?? null) as UserRole | null,
    avatarUrl: row.avatar_url,
    presenceStatus: toPresenceStatus(
      row.presence_status,
      row.is_online ? "online" : "offline",
    ),
    lastSeen: row.last_seen,
  };
}
