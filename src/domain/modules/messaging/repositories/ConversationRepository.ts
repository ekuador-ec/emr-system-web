import type { Conversation, MessagingContact } from "@/domain/modules/messaging/models/Conversation";

export interface ConversationRepository {
  listForUser(userId: string): Promise<Conversation[]>;
  getById(conversationId: string): Promise<Conversation | null>;
  getOrCreateDirect(otherUserId: string): Promise<string>;
  markRead(conversationId: string): Promise<void>;
  setMuted(conversationId: string, muted: boolean): Promise<void>;
  listContacts(): Promise<MessagingContact[]>;
}
