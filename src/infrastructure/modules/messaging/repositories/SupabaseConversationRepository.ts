import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConversationRepository } from "@/domain/modules/messaging/repositories/ConversationRepository";
import type {
  Conversation,
  ConversationParticipantSummary,
  ConversationType,
  MessagingContact,
} from "@/domain/modules/messaging/models/Conversation";
import type { UserRole } from "@/domain/modules/users/models/User";
import {
  mapContactRow,
  type ContactRow,
} from "@/infrastructure/modules/messaging/mappers/conversationMapper";

interface ConversationFlatRow {
  conversation_id: string;
  conversation_type: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_message_sender: string | null;
  participant_user_id: string;
  participant_last_read: string;
  participant_muted: boolean;
  profile_first_name: string | null;
  profile_last_name: string | null;
  profile_role: string | null;
  profile_avatar_url: string | null;
}

interface UnreadRow {
  conversation_id: string;
  unread: number;
}

function rowToParticipant(row: ConversationFlatRow): ConversationParticipantSummary {
  return {
    userId: row.participant_user_id,
    firstName: row.profile_first_name,
    lastName: row.profile_last_name,
    role: (row.profile_role ?? null) as UserRole | null,
    avatarUrl: row.profile_avatar_url,
    lastReadAt: row.participant_last_read,
    muted: row.participant_muted,
  };
}

function groupFlatRows(
  rows: ConversationFlatRow[],
  unreadByConversation: Map<string, number>,
): Conversation[] {
  const byId = new Map<string, Conversation>();

  for (const row of rows) {
    const existing = byId.get(row.conversation_id);
    if (existing) {
      existing.participants.push(rowToParticipant(row));
      continue;
    }
    byId.set(row.conversation_id, {
      id: row.conversation_id,
      type: (row.conversation_type as ConversationType) ?? "direct",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastMessageAt: row.last_message_at,
      lastMessagePreview: row.last_message_preview,
      lastMessageSenderId: row.last_message_sender,
      participants: [rowToParticipant(row)],
      unreadCount: unreadByConversation.get(row.conversation_id) ?? 0,
    });
  }

  return Array.from(byId.values());
}

export class SupabaseConversationRepository implements ConversationRepository {
  private readonly supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async listForUser(userId: string): Promise<Conversation[]> {
    const { data, error } = await this.supabase.rpc("list_user_conversations");
    if (error) {
      throw new Error(error.message);
    }

    const rows = (data ?? []) as ConversationFlatRow[];
    if (rows.length === 0) return [];

    const { data: unreadRows, error: unreadError } = await this.supabase.rpc(
      "get_unread_counts",
      { p_user: userId },
    );
    if (unreadError) {
      throw new Error(unreadError.message);
    }

    const unreadByConversation = new Map<string, number>();
    for (const u of (unreadRows ?? []) as UnreadRow[]) {
      unreadByConversation.set(u.conversation_id, u.unread);
    }

    const conversations = groupFlatRows(rows, unreadByConversation);

    conversations.sort((a, b) => {
      const ta = a.lastMessageAt ?? a.updatedAt;
      const tb = b.lastMessageAt ?? b.updatedAt;
      return new Date(tb).getTime() - new Date(ta).getTime();
    });

    return conversations;
  }

  async getById(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await this.supabase.rpc("get_user_conversation", {
      p_conversation: conversationId,
    });

    if (error) {
      throw new Error(error.message);
    }

    const rows = (data ?? []) as ConversationFlatRow[];
    if (rows.length === 0) return null;

    const conversations = groupFlatRows(rows, new Map());
    return conversations[0] ?? null;
  }

  async getOrCreateDirect(otherUserId: string): Promise<string> {
    const { data, error } = await this.supabase.rpc(
      "get_or_create_direct_conversation",
      { p_other_user: otherUserId },
    );

    if (error) {
      throw new Error(error.message);
    }

    if (typeof data !== "string") {
      throw new Error("Respuesta invalida del servidor al iniciar la conversacion");
    }

    return data;
  }

  async markRead(conversationId: string): Promise<void> {
    const { error } = await this.supabase.rpc("mark_conversation_read", {
      p_conversation: conversationId,
    });
    if (error) {
      throw new Error(error.message);
    }
  }

  async setMuted(conversationId: string, muted: boolean): Promise<void> {
    const { data: userData, error: userError } = await this.supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error("Sesion no autenticada");
    }
    const { error } = await this.supabase
      .from("conversation_participants")
      .update({ muted })
      .eq("conversation_id", conversationId)
      .eq("user_id", userData.user.id);
    if (error) {
      throw new Error(error.message);
    }
  }

  async listContacts(): Promise<MessagingContact[]> {
    const { data, error } = await this.supabase.rpc("list_messaging_contacts");
    if (error) {
      throw new Error(error.message);
    }
    return ((data ?? []) as ContactRow[]).map(mapContactRow);
  }
}
