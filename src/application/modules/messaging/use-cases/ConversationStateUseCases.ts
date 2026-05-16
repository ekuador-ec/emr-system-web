import type { ConversationRepository } from "@/domain/modules/messaging/repositories/ConversationRepository";

export class MarkConversationReadUseCase {
  private readonly repo: ConversationRepository;

  constructor(repo: ConversationRepository) {
    this.repo = repo;
  }

  async execute(conversationId: string): Promise<void> {
    if (!conversationId) return;
    try {
      await this.repo.markRead(conversationId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      throw new Error(`No se pudo marcar como leida la conversacion: ${message}`);
    }
  }
}

export class ToggleConversationMuteUseCase {
  private readonly repo: ConversationRepository;

  constructor(repo: ConversationRepository) {
    this.repo = repo;
  }

  async execute(conversationId: string, muted: boolean): Promise<void> {
    if (!conversationId) return;
    try {
      await this.repo.setMuted(conversationId, muted);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      throw new Error(`No se pudo actualizar la preferencia de notificaciones: ${message}`);
    }
  }
}
