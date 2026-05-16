import type { Conversation } from "@/domain/modules/messaging/models/Conversation";
import type { ConversationRepository } from "@/domain/modules/messaging/repositories/ConversationRepository";

export class GetConversationUseCase {
  private readonly repo: ConversationRepository;

  constructor(repo: ConversationRepository) {
    this.repo = repo;
  }

  async execute(conversationId: string): Promise<Conversation | null> {
    if (!conversationId) return null;
    try {
      return await this.repo.getById(conversationId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      throw new Error(`No se pudo cargar la conversacion: ${message}`);
    }
  }
}
