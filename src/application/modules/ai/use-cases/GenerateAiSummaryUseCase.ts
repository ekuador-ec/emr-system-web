import type {
  AiServiceRepository,
  GenerateSummaryInput,
} from "@/domain/modules/ai/repositories/AiServiceRepository";
import type { GenerateAiSummaryResult } from "@/domain/modules/ai/models/Summary";

export class GenerateAiSummaryUseCase {
  private readonly repo: AiServiceRepository;

  constructor(repo: AiServiceRepository) {
    this.repo = repo;
  }

  async execute(input: GenerateSummaryInput): Promise<GenerateAiSummaryResult> {
    if (!input.entityId) {
      throw new Error("Identificador de la entidad invalido");
    }
    try {
      return await this.repo.generateSummary(input);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo generar el resumen";
      throw new Error(`No se pudo generar el resumen: ${message}`);
    }
  }
}
