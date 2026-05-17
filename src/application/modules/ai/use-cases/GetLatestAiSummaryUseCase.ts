import type { AiServiceRepository } from "@/domain/modules/ai/repositories/AiServiceRepository";
import type { AiSummary, AiSummaryKind } from "@/domain/modules/ai/models/Summary";

export class GetLatestAiSummaryUseCase {
  private readonly repo: AiServiceRepository;

  constructor(repo: AiServiceRepository) {
    this.repo = repo;
  }

  async execute(kind: AiSummaryKind, entityId: string): Promise<AiSummary | null> {
    if (!entityId) return null;
    try {
      return await this.repo.getLatestSummary(kind, entityId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo recuperar el resumen";
      throw new Error(`No se pudo recuperar el resumen: ${message}`);
    }
  }
}
