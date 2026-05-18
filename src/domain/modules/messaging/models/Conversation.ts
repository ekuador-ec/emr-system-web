import type { PresenceStatus, UserRole } from "@/domain/modules/users/models/User";

export type ConversationType = "direct" | "group";

export interface ConversationParticipantSummary {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole | null;
  avatarUrl: string | null;
  lastReadAt: string;
  muted: boolean;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastMessageSenderId: string | null;
  participants: ConversationParticipantSummary[];
  unreadCount: number;
}

export interface MessagingContact {
  id: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole | null;
  avatarUrl: string | null;
  presenceStatus: PresenceStatus;
  lastSeen: string | null;
}
