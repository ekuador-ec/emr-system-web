import type { Conversation } from "@/domain/modules/messaging/models/Conversation";
import type { ConversationRepository } from "@/domain/modules/messaging/repositories/ConversationRepository";

export class ListConversationsUseCase {
  private readonly repo: ConversationRepository;

  constructor(repo: ConversationRepository) {
    this.repo = repo;
  }

  async execute(userId: string): Promise<Conversation[]> {
    if (!userId) {
      throw new Error("Sesion no autenticada");
    }
    try {
      return await this.repo.listForUser(userId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      throw new Error(`No se pudieron cargar las conversaciones: ${message}`);
    }
  }
}
