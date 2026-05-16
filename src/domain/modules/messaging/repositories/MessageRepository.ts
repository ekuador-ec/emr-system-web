import type { Message, MessagePage } from "@/domain/modules/messaging/models/Message";

export interface ListMessagesOptions {
  before?: string | null;
  limit?: number;
}

export interface MessageRepository {
  listByConversation(conversationId: string, options?: ListMessagesOptions): Promise<MessagePage>;
  send(conversationId: string, content: string): Promise<Message>;
}
