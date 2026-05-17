import type { ReportsRepository } from "@/domain/modules/reports/repositories/ReportsRepository";
import type { ReportRangeOnly } from "@/domain/modules/reports/models/ReportRange";
import type { DiagnosesSummary } from "@/domain/modules/reports/models/DiagnosesInsights";
import { assertReportRange } from "./shared/assertReportRange";

export class GetDiagnosesSummaryUseCase {
  private readonly repository: ReportsRepository;

  constructor(repository: ReportsRepository) {
    this.repository = repository;
  }

  async execute(range: ReportRangeOnly): Promise<DiagnosesSummary> {
    assertReportRange(range);
    try {
      return await this.repository.getDiagnosesSummary(range);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al obtener el resumen de diagnosticos.";
      throw new Error(message);
    }
  }
}
