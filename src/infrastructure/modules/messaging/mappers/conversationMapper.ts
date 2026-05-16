import type { UserRole } from "@/domain/modules/users/models/User";
import type { MessagingContact } from "@/domain/modules/messaging/models/Conversation";

export interface ContactRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  avatar_url: string | null;
  is_online: boolean;
  last_seen: string | null;
}

export function mapContactRow(row: ContactRow): MessagingContact {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    role: (row.role ?? null) as UserRole | null,
    avatarUrl: row.avatar_url,
    isOnline: row.is_online,
    lastSeen: row.last_seen,
  };
}
