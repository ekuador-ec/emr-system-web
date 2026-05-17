import type {
  AiSummary,
  AiSummaryKind,
  AiModelPreference,
  GenerateAiSummaryResult,
} from "@/domain/modules/ai/models/Summary";
import type {
  AiConversation,
  AiConversationWithMessages,
  AiMessage,
} from "@/domain/modules/ai/models/Conversation";

export interface GenerateSummaryInput {
  kind: AiSummaryKind;
  entityId: string;
  payload: Record<string, unknown>;
  preference: AiModelPreference;
  forceRefresh?: boolean;
}

export interface CreateConversationInput {
  kind: AiSummaryKind;
  entityId: string;
  summaryId?: string | null;
  title?: string | null;
  modelPreference: AiModelPreference;
}

export interface SendChatMessageInput {
  conversationId: string;
  message: string;
}

export interface SseChatEvents {
  onConversation?: (conversation: AiConversation) => void;
  onDelta?: (delta: string) => void;
  onDone?: () => void;
  onCompleted?: (payload: { userMessage: AiMessage; assistantMessage: AiMessage }) => void;
  onError?: (error: { code: string; message: string }) => void;
}

export interface AiServiceRepository {
  generateSummary(input: GenerateSummaryInput): Promise<GenerateAiSummaryResult>;
  getLatestSummary(kind: AiSummaryKind, entityId: string): Promise<AiSummary | null>;

  createConversation(input: CreateConversationInput): Promise<AiConversation>;
  listConversations(params: { limit: number; offset: number }): Promise<AiConversation[]>;
  getConversation(conversationId: string): Promise<AiConversationWithMessages>;
  deleteConversation(conversationId: string): Promise<void>;

  streamChatMessage(
    input: SendChatMessageInput,
    events: SseChatEvents,
    signal?: AbortSignal,
  ): Promise<void>;
}
