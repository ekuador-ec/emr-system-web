import type { AiModelPreference, AiProviderName, AiSummaryKind } from "./Summary";

export type AiMessageRole = "system" | "user" | "assistant";

export type AiConversationKind = AiSummaryKind | "general";

export interface AiMessage {
  id: string;
  conversationId: string;
  role: AiMessageRole;
  content: string;
  provider: AiProviderName | null;
  model: string | null;
  tokensInput: number | null;
  tokensOutput: number | null;
  createdAt: string;
}

export interface AiConversation {
  id: string;
  summaryId: string | null;
  kind: AiConversationKind;
  entityId: string | null;
  userId: string;
  title: string | null;
  modelPreference: AiModelPreference;
  createdAt: string;
  updatedAt: string;
}

export interface AiConversationWithMessages {
  conversation: AiConversation;
  messages: AiMessage[];
}
