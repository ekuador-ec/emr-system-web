import type { ReportsRepository } from "@/domain/modules/reports/repositories/ReportsRepository";
import type {
  MetricSeriesPoint,
  MetricSeriesRequest,
} from "@/domain/modules/reports/models/MetricSeries";

const MAX_RANGE_DAYS = 365;

function assertLongRange(from: string, to: string): void {
  if (!from || !to) {
    throw new Error("Debe seleccionar un rango de fechas para la serie historica.");
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    throw new Error("Las fechas del rango no son validas.");
  }

  if (fromDate.getTime() > toDate.getTime()) {
    throw new Error("La fecha inicial no puede ser mayor a la fecha final.");
  }

  const diffMs = toDate.getTime() - fromDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  if (diffDays > MAX_RANGE_DAYS) {
    throw new Error(`El rango historico no puede superar ${MAX_RANGE_DAYS} dias.`);
  }
}

export class GetMetricSeriesUseCase {
  private readonly repository: ReportsRepository;

  constructor(repository: ReportsRepository) {
    this.repository = repository;
  }

  async execute(request: MetricSeriesRequest): Promise<MetricSeriesPoint[]> {
    if (!request.key) {
      throw new Error("Debe indicar la metric_key a consultar.");
    }
    assertLongRange(request.from, request.to);

    try {
      return await this.repository.getMetricSeries(request);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al obtener la serie historica.";
      throw new Error(message);
    }
  }
}
