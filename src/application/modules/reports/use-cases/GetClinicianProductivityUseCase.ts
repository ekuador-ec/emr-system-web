import type { ReportsRepository } from "@/domain/modules/reports/repositories/ReportsRepository";
import type { ReportRangeOnly } from "@/domain/modules/reports/models/ReportRange";
import type {
  ClinicianProductivityFilters,
  ClinicianProductivityRow,
} from "@/domain/modules/reports/models/AdminInsights";
import { assertReportRange } from "./shared/assertReportRange";

export class GetClinicianProductivityUseCase {
  private readonly repository: ReportsRepository;

  constructor(repository: ReportsRepository) {
    this.repository = repository;
  }

  async execute(
    range: ReportRangeOnly,
    filters?: ClinicianProductivityFilters,
  ): Promise<ClinicianProductivityRow[]> {
    assertReportRange(range);
    try {
      return await this.repository.getClinicianProductivity(range, filters);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al obtener la productividad del equipo clinico.";
      throw new Error(message);
    }
  }
}
