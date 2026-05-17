import type { ReportsRepository } from "@/domain/modules/reports/repositories/ReportsRepository";
import type { ReportRangeOnly } from "@/domain/modules/reports/models/ReportRange";
import type { GeneralKpis } from "@/domain/modules/reports/models/BusinessKpis";
import { assertReportRange } from "./shared/assertReportRange";

export class GetGeneralKpisUseCase {
  private readonly repository: ReportsRepository;

  constructor(repository: ReportsRepository) {
    this.repository = repository;
  }

  async execute(range: ReportRangeOnly): Promise<GeneralKpis> {
    assertReportRange(range);
    try {
      return await this.repository.getGeneralKpis(range);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al obtener los indicadores generales.";
      throw new Error(message);
    }
  }
}
