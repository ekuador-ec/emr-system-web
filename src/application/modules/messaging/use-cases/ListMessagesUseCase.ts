import type { MessagePage } from "@/domain/modules/messaging/models/Message";
import type { MessageRepository, ListMessagesOptions } from "@/domain/modules/messaging/repositories/MessageRepository";

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

export class ListMessagesUseCase {
  private readonly repo: MessageRepository;

  constructor(repo: MessageRepository) {
    this.repo = repo;
  }

  async execute(conversationId: string, options?: ListMessagesOptions): Promise<MessagePage> {
    if (!conversationId) {
      throw new Error("Conversacion no valida");
    }

    const limit = Math.min(options?.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    try {
      return await this.repo.listByConversation(conversationId, {
        before: options?.before ?? null,
        limit,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      throw new Error(`No se pudieron cargar los mensajes: ${message}`);
    }
  }
}
