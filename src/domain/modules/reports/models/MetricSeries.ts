export type MetricKey =
  | "patients.total"
  | "patients.created.daily"
  | "medical_records.total"
  | "medical_records.created.daily"
  | "evolutions.created.daily"
  | "evolutions.closed.daily"
  | "diagnoses.created.daily"
  | "users.active.total"
  | "messages.created.daily";

export interface MetricSeriesPoint {
  snapshotDate: string;
  value: number;
  dims: Record<string, unknown>;
}

export interface MetricSeriesRequest {
  key: MetricKey;
  from: string;
  to: string;
  dims?: Record<string, unknown>;
}
