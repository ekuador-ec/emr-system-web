import type { ReportsRepository } from "@/domain/modules/reports/repositories/ReportsRepository";
import type { ReportRangeOnly } from "@/domain/modules/reports/models/ReportRange";
import type { DemographicBuckets } from "@/domain/modules/reports/models/BusinessKpis";
import { assertReportRange } from "./shared/assertReportRange";

export class GetPatientDemographicsUseCase {
  private readonly repository: ReportsRepository;

  constructor(repository: ReportsRepository) {
    this.repository = repository;
  }

  async execute(range: ReportRangeOnly): Promise<DemographicBuckets> {
    assertReportRange(range);
    try {
      return await this.repository.getPatientDemographics(range);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al obtener la demografia de pacientes.";
      throw new Error(message);
    }
  }
}
