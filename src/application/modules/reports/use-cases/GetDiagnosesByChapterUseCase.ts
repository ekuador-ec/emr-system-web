import type { ReportsRepository } from "@/domain/modules/reports/repositories/ReportsRepository";
import type { ReportRangeOnly } from "@/domain/modules/reports/models/ReportRange";
import type {
  DiagnosesByChapter,
  DiagnosesChapterFilters,
} from "@/domain/modules/reports/models/DiagnosesInsights";
import { assertReportRange } from "./shared/assertReportRange";

export class GetDiagnosesByChapterUseCase {
  private readonly repository: ReportsRepository;

  constructor(repository: ReportsRepository) {
    this.repository = repository;
  }

  async execute(
    range: ReportRangeOnly,
    filters?: DiagnosesChapterFilters,
  ): Promise<DiagnosesByChapter[]> {
    assertReportRange(range);
    try {
      return await this.repository.getDiagnosesByChapter(range, filters);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al obtener los diagnosticos por capitulo.";
      throw new Error(message);
    }
  }
}
