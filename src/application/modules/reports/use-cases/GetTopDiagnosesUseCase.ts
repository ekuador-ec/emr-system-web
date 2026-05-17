import type { ReportsRepository } from "@/domain/modules/reports/repositories/ReportsRepository";
import type { ReportRangeOnly } from "@/domain/modules/reports/models/ReportRange";
import type {
  TopDiagnosesFilters,
  TopDiagnosis,
} from "@/domain/modules/reports/models/BusinessKpis";
import { assertReportRange } from "./shared/assertReportRange";

export class GetTopDiagnosesUseCase {
  private readonly repository: ReportsRepository;

  constructor(repository: ReportsRepository) {
    this.repository = repository;
  }

  async execute(
    range: ReportRangeOnly,
    filters?: TopDiagnosesFilters,
  ): Promise<TopDiagnosis[]> {
    assertReportRange(range);
    try {
      return await this.repository.getTopDiagnoses(range, filters);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al obtener los diagnosticos mas frecuentes.";
      throw new Error(message);
    }
  }
}
