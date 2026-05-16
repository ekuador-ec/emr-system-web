import type { MessagingContact } from "@/domain/modules/messaging/models/Conversation";
import type { ConversationRepository } from "@/domain/modules/messaging/repositories/ConversationRepository";

export class ListMessagingContactsUseCase {
  private readonly repo: ConversationRepository;

  constructor(repo: ConversationRepository) {
    this.repo = repo;
  }

  async execute(): Promise<MessagingContact[]> {
    try {
      return await this.repo.listContacts();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      throw new Error(`No se pudieron cargar los contactos: ${message}`);
    }
  }
}
