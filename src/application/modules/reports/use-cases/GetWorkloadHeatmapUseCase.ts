import type { ReportsRepository } from "@/domain/modules/reports/repositories/ReportsRepository";
import type { ReportRangeOnly } from "@/domain/modules/reports/models/ReportRange";
import type { WorkloadHeatmapCell } from "@/domain/modules/reports/models/AdminInsights";
import { assertReportRange } from "./shared/assertReportRange";

export class GetWorkloadHeatmapUseCase {
  private readonly repository: ReportsRepository;

  constructor(repository: ReportsRepository) {
    this.repository = repository;
  }

  async execute(range: ReportRangeOnly): Promise<WorkloadHeatmapCell[]> {
    assertReportRange(range);
    try {
      return await this.repository.getWorkloadHeatmap(range);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al obtener el heatmap de carga de trabajo.";
      throw new Error(message);
    }
  }
}
