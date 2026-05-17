import type { ReportsRepository } from "@/domain/modules/reports/repositories/ReportsRepository";
import type { ReportRangeOnly } from "@/domain/modules/reports/models/ReportRange";
import type { EvolutionDistribution } from "@/domain/modules/reports/models/ClinicalActivity";
import { assertReportRange } from "./shared/assertReportRange";

export class GetEvolutionDistributionUseCase {
  private readonly repository: ReportsRepository;

  constructor(repository: ReportsRepository) {
    this.repository = repository;
  }

  async execute(range: ReportRangeOnly): Promise<EvolutionDistribution> {
    assertReportRange(range);
    try {
      return await this.repository.getEvolutionDistribution(range);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al obtener la distribucion de evoluciones.";
      throw new Error(message);
    }
  }
}
