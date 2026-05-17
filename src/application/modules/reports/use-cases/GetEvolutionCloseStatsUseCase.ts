import type { ReportsRepository } from "@/domain/modules/reports/repositories/ReportsRepository";
import type { ReportRangeOnly } from "@/domain/modules/reports/models/ReportRange";
import type { EvolutionCloseStats } from "@/domain/modules/reports/models/ClinicalActivity";
import { assertReportRange } from "./shared/assertReportRange";

export class GetEvolutionCloseStatsUseCase {
  private readonly repository: ReportsRepository;

  constructor(repository: ReportsRepository) {
    this.repository = repository;
  }

  async execute(range: ReportRangeOnly): Promise<EvolutionCloseStats> {
    assertReportRange(range);
    try {
      return await this.repository.getEvolutionCloseStats(range);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al obtener las estadisticas de cierre.";
      throw new Error(message);
    }
  }
}
