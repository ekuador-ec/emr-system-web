export type ReportGranularity = "day" | "week" | "month";

export interface ReportRange {
  from: string;
  to: string;
  granularity: ReportGranularity;
}

export interface ReportRangeOnly {
  from: string;
  to: string;
}
