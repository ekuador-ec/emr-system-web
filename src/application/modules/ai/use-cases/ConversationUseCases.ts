import type {
  AiServiceRepository,
  CreateConversationInput,
} from "@/domain/modules/ai/repositories/AiServiceRepository";
import type {
  AiConversation,
  AiConversationWithMessages,
} from "@/domain/modules/ai/models/Conversation";

export class StartAiConversationUseCase {
  private readonly repo: AiServiceRepository;
  constructor(repo: AiServiceRepository) {
    this.repo = repo;
  }
  async execute(input: CreateConversationInput): Promise<AiConversation> {
    if (!input.entityId) {
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
