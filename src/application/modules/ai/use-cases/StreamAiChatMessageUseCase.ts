import type {
  AiServiceRepository,
  SendChatMessageInput,
  SseChatEvents,
} from "@/domain/modules/ai/repositories/AiServiceRepository";

const MIN_LENGTH = 1;
const MAX_LENGTH = 4000;

export class StreamAiChatMessageUseCase {
  private readonly repo: AiServiceRepository;

  constructor(repo: AiServiceRepository) {
    this.repo = repo;
  }

  async execute(
    input: SendChatMessageInput,
    events: SseChatEvents,
    signal?: AbortSignal,
  ): Promise<void> {
    if (!input.conversationId) {
      throw new Error("Conversacion no valida");
    }
    const trimmed = input.message.trim();
    if (trimmed.length < MIN_LENGTH) {
      throw new Error("El mensaje no puede estar vacio");
    }
    if (trimmed.length > MAX_LENGTH) {
      throw new Error(`El mensaje supera el limite de ${MAX_LENGTH} caracteres`);
    }

    await this.repo.streamChatMessage(
      { conversationId: input.conversationId, message: trimmed },
      events,
      signal,
    );
  }
}
