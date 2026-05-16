import type { Message } from "@/domain/modules/messaging/models/Message";
import type { MessageRepository } from "@/domain/modules/messaging/repositories/MessageRepository";

const MIN_LENGTH = 1;
const MAX_LENGTH = 4000;

export class SendMessageUseCase {
  private readonly repo: MessageRepository;

  constructor(repo: MessageRepository) {
    this.repo = repo;
  }

  async execute(conversationId: string, content: string): Promise<Message> {
    if (!conversationId) {
      throw new Error("Conversacion no valida");
    }

    const trimmed = content.trim();
    if (trimmed.length < MIN_LENGTH) {
      throw new Error("El mensaje no puede estar vacio");
    }
    if (trimmed.length > MAX_LENGTH) {
      throw new Error(`El mensaje supera el limite de ${MAX_LENGTH} caracteres`);
    }

    try {
      return await this.repo.send(conversationId, trimmed);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      throw new Error(`No se pudo enviar el mensaje: ${message}`);
    }
  }
}
