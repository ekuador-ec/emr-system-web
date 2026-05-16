export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  deletedAt: string | null;
}

export interface MessagePage {
  messages: Message[];
  hasMore: boolean;
  nextCursor: string | null;
}
