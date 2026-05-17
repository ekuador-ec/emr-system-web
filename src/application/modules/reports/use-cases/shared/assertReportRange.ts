import type { ReportRange, ReportRangeOnly } from "@/domain/modules/reports/models/ReportRange";

const MAX_RANGE_DAYS = 90;

export function assertReportRange(range: ReportRangeOnly | ReportRange): void {
  if (!range.from || !range.to) {
    throw new Error("Debe seleccionar un rango de fechas para el reporte.");
  }

  const from = new Date(range.from);
  const to = new Date(range.to);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    throw new Error("Las fechas del rango no son validas.");
  }

  if (from.getTime() > to.getTime()) {
    throw new Error("La fecha inicial no puede ser mayor a la fecha final.");
  }

  const diffMs = to.getTime() - from.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  if (diffDays > MAX_RANGE_DAYS) {
    throw new Error(`El rango del reporte no puede superar ${MAX_RANGE_DAYS} dias.`);
  }
}
