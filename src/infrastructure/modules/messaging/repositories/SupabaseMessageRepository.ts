import type { SupabaseClient } from "@supabase/supabase-js";
import type { Message, MessagePage } from "@/domain/modules/messaging/models/Message";
import type {
  MessageRepository,
  ListMessagesOptions,
} from "@/domain/modules/messaging/repositories/MessageRepository";
import {
  mapMessageRow,
  type MessageRow,
} from "@/infrastructure/modules/messaging/mappers/messageMapper";

const MESSAGE_SELECT = "id, conversation_id, sender_id, content, created_at, deleted_at";

export class SupabaseMessageRepository implements MessageRepository {
  private readonly supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async listByConversation(
    conversationId: string,
    options?: ListMessagesOptions,
  ): Promise<MessagePage> {
    const limit = options?.limit ?? 50;

    let query = this.supabase
      .from("messages")
      .select(MESSAGE_SELECT)
      .eq("conversation_id", conversationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit + 1);

    if (options?.before) {
      query = query.lt("created_at", options.before);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }

    const rows = (data ?? []) as MessageRow[];
    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;

    const messages = pageRows.map(mapMessageRow).reverse();

    return {
      messages,
      hasMore,
      nextCursor: hasMore ? pageRows[pageRows.length - 1].created_at : null,
    };
  }

  async send(conversationId: string, content: string): Promise<Message> {
    const { data: userData, error: userError } = await this.supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error("Sesion no autenticada");
    }

    const { data, error } = await this.supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: userData.user.id,
        content,
      })
      .select(MESSAGE_SELECT)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapMessageRow(data as MessageRow);
  }
}
