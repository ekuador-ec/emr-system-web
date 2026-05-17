import type {
  AiServiceRepository,
  CreateConversationInput,
  GenerateSummaryInput,
  SendChatMessageInput,
  SseChatEvents,
} from "@/domain/modules/ai/repositories/AiServiceRepository";
import type {
  AiSummary,
  AiSummaryKind,
  GenerateAiSummaryResult,
} from "@/domain/modules/ai/models/Summary";
import type {
  AiConversation,
  AiConversationWithMessages,
  AiMessage,
} from "@/domain/modules/ai/models/Conversation";
import { AiApiClient } from "@/infrastructure/modules/ai/AiApiClient";
import { consumeSse } from "@/infrastructure/modules/ai/sseParser";

export class HttpAiServiceRepository implements AiServiceRepository {
  private readonly client: AiApiClient;

  constructor(client: AiApiClient) {
    this.client = client;
  }

  async generateSummary(input: GenerateSummaryInput): Promise<GenerateAiSummaryResult> {
    const path =
      input.kind === "medical_record"
        ? "/v1/summaries/medical-record"
        : "/v1/summaries/evolution";

    const body = {
      entityId: input.entityId,
      payload: input.payload,
      preference: input.preference,
      forceRefresh: input.forceRefresh ?? false,
    };
    const response = await this.client.request<{ cached: boolean; summary: AiSummary }>(
      "POST",
      path,
      body,
    );
    return { cached: response.cached, summary: response.summary };
  }

  async getLatestSummary(kind: AiSummaryKind, entityId: string): Promise<AiSummary | null> {
    try {
      const response = await this.client.request<{ summary: AiSummary }>(
        "GET",
        `/v1/summaries/${kind}/${entityId}`,
      );
      return response.summary;
    } catch (error) {
      if (error instanceof Error && "status" in error && (error as { status?: number }).status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createConversation(input: CreateConversationInput): Promise<AiConversation> {
    const response = await this.client.request<{ conversation: AiConversation }>(
      "POST",
      "/v1/conversations",
      {
        kind: input.kind,
        entityId: input.entityId,
        summaryId: input.summaryId ?? null,
        title: input.title ?? null,
        modelPreference: input.modelPreference,
      },
    );
    return response.conversation;
  }

  async listConversations(params: { limit: number; offset: number }): Promise<AiConversation[]> {
    const query = new URLSearchParams({
      limit: String(params.limit),
      offset: String(params.offset),
    }).toString();
    const response = await this.client.request<{ items: AiConversation[] }>(
      "GET",
      `/v1/conversations?${query}`,
    );
    return response.items;
  }

  async getConversation(conversationId: string): Promise<AiConversationWithMessages> {
    return this.client.request<AiConversationWithMessages>(
      "GET",
      `/v1/conversations/${conversationId}`,
    );
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await this.client.request<void>("DELETE", `/v1/conversations/${conversationId}`);
  }

  async streamChatMessage(
    input: SendChatMessageInput,
    events: SseChatEvents,
    signal?: AbortSignal,
  ): Promise<void> {
    const controller = signal ? null : new AbortController();
    const usedSignal = signal ?? controller!.signal;

    const reader = await this.client.openSseStream(
      "POST",
      `/v1/conversations/${input.conversationId}/messages`,
      { message: input.message },
      usedSignal,
    );

    await consumeSse(
      reader,
      ({ name, data }) => dispatchSseEvent(name, data, events),
      usedSignal,
    );
  }
}

function dispatchSseEvent(name: string, data: string, events: SseChatEvents): void {
  if (!data) return;
  switch (name) {
    case "conversation": {
      const parsed = safeParse<AiConversation>(data);
      if (parsed && events.onConversation) events.onConversation(parsed);
      return;
    }
    case "delta": {
      const parsed = safeParse<{ delta: string }>(data);
      if (parsed?.delta && events.onDelta) events.onDelta(parsed.delta);
      return;
    }
    case "done": {
      if (events.onDone) events.onDone();
      return;
    }
    case "completed": {
      const parsed = safeParse<{ userMessage: AiMessage; assistantMessage: AiMessage }>(data);
      if (parsed && events.onCompleted) events.onCompleted(parsed);
      return;
    }
    case "error": {
      const parsed = safeParse<{ error: { code: string; message: string } }>(data);
      if (parsed?.error && events.onError) events.onError(parsed.error);
      return;
    }
    default:
      return;
  }
}

function safeParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
