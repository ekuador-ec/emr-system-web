import type {
  AiServiceRepository,
  CreateConversationInput,
} from "@/domain/modules/ai/repositories/AiServiceRepository";
import type {
  AiConversation,
  AiConversationWithMessages,
} from "@/domain/modules/ai/models/Conversation";
import type { AiModelPreference } from "@/domain/modules/ai/models/Summary";

export class StartAiConversationUseCase {
  private readonly repo: AiServiceRepository;
  constructor(repo: AiServiceRepository) {
    this.repo = repo;
  }
  async execute(input: CreateConversationInput): Promise<AiConversation> {
    if (input.kind === "general") {
      if (input.entityId) {
        throw new Error("Las conversaciones generales no deben incluir un identificador de entidad");
      }
      if (input.summaryId) {
        throw new Error("Las conversaciones generales no se asocian a un resumen previo");
      }
    } else if (!input.entityId) {
      throw new Error("Identificador de la entidad invalido");
    }
    return this.repo.createConversation(input);
  }
}

export class ListAiConversationsUseCase {
  private readonly repo: AiServiceRepository;
  constructor(repo: AiServiceRepository) {
    this.repo = repo;
  }
  execute(params: { limit: number; offset: number }): Promise<AiConversation[]> {
    return this.repo.listConversations(params);
  }
}

export class GetAiConversationUseCase {
  private readonly repo: AiServiceRepository;
  constructor(repo: AiServiceRepository) {
    this.repo = repo;
  }
  execute(conversationId: string): Promise<AiConversationWithMessages> {
    return this.repo.getConversation(conversationId);
  }
}

export class DeleteAiConversationUseCase {
  private readonly repo: AiServiceRepository;
  constructor(repo: AiServiceRepository) {
    this.repo = repo;
  }
  execute(conversationId: string): Promise<void> {
    return this.repo.deleteConversation(conversationId);
  }
}

export class UpdateAiConversationPreferenceUseCase {
  private readonly repo: AiServiceRepository;
  constructor(repo: AiServiceRepository) {
    this.repo = repo;
  }
  execute(conversationId: string, modelPreference: AiModelPreference): Promise<AiConversation> {
    if (!conversationId) throw new Error("Conversacion no valida");
    return this.repo.updateConversationPreference(conversationId, modelPreference);
  }
}
