import type { ConversationRepository } from "@/domain/modules/messaging/repositories/ConversationRepository";

export class OpenDirectConversationUseCase {
  private readonly repo: ConversationRepository;

  constructor(repo: ConversationRepository) {
    this.repo = repo;
  }

  async execute(otherUserId: string): Promise<string> {
    if (!otherUserId) {
      throw new Error("Debes seleccionar un usuario para iniciar la conversacion");
    }
    try {
      return await this.repo.getOrCreateDirect(otherUserId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      throw new Error(`No se pudo iniciar la conversacion: ${message}`);
    }
  }
}
