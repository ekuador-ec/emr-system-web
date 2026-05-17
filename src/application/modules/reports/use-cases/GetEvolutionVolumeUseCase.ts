import type { ReportsRepository } from "@/domain/modules/reports/repositories/ReportsRepository";
import type { ReportRange } from "@/domain/modules/reports/models/ReportRange";
import type { EvolutionVolumePoint } from "@/domain/modules/reports/models/BusinessKpis";
import { assertReportRange } from "./shared/assertReportRange";

export class GetEvolutionVolumeUseCase {
  private readonly repository: ReportsRepository;

  constructor(repository: ReportsRepository) {
    this.repository = repository;
  }

  async execute(range: ReportRange): Promise<EvolutionVolumePoint[]> {
    assertReportRange(range);
    try {
      return await this.repository.getEvolutionVolume(range);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al obtener el volumen de evoluciones.";
      throw new Error(message);
    }
  }
}
