import type { ReportGranularity } from "@/domain/modules/reports/models/ReportRange";

export type DateRangePreset =
  | "today"
  | "yesterday"
  | "last7"
  | "last30"
  | "last90"
  | "last180"
  | "last365"
  | "mtd"
  | "lastMonth"
  | "ytd"
  | "lastFullYear"
  | "custom";

export interface DateRangeValue {
  from: string;
  to: string;
}

export const PRESET_LABELS: Record<DateRangePreset, string> = {
  today: "Hoy",
  yesterday: "Ayer",
  last7: "Ultimos 7 dias",
  last30: "Ultimos 30 dias",
  last90: "Ultimos 90 dias",
  last180: "Ultimos 180 dias",
  last365: "Ultimos 365 dias",
  mtd: "Mes en curso",
  lastMonth: "Mes anterior",
  ytd: "Ano en curso",
  lastFullYear: "Ano anterior",
  custom: "Personalizado",
};

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function toIso(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function computePresetRange(preset: DateRangePreset, now: Date = new Date()): DateRangeValue {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case "today":
      return { from: toIso(today), to: toIso(today) };
    case "yesterday": {
      const y = addDays(today, -1);
      return { from: toIso(y), to: toIso(y) };
    }
    case "last7":
      return { from: toIso(addDays(today, -6)), to: toIso(today) };
    case "last30":
      return { from: toIso(addDays(today, -29)), to: toIso(today) };
    case "last90":
      return { from: toIso(addDays(today, -89)), to: toIso(today) };
    case "last180":
      return { from: toIso(addDays(today, -179)), to: toIso(today) };
    case "last365":
      return { from: toIso(addDays(today, -364)), to: toIso(today) };
    case "mtd": {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: toIso(first), to: toIso(today) };
    }
    case "lastMonth": {
      const firstThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastPrevMonth = addDays(firstThisMonth, -1);
      const firstPrevMonth = new Date(
        lastPrevMonth.getFullYear(),
        lastPrevMonth.getMonth(),
        1,
      );
      return { from: toIso(firstPrevMonth), to: toIso(lastPrevMonth) };
    }
    case "ytd": {
      const first = new Date(today.getFullYear(), 0, 1);
      return { from: toIso(first), to: toIso(today) };
    }
    case "lastFullYear": {
      const firstPrev = new Date(today.getFullYear() - 1, 0, 1);
      const lastPrev = new Date(today.getFullYear() - 1, 11, 31);
      return { from: toIso(firstPrev), to: toIso(lastPrev) };
    }
    case "custom":
    default:
      return { from: toIso(addDays(today, -6)), to: toIso(today) };
  }
}

export function rangeDays(range: DateRangeValue): number {
  const from = new Date(range.from);
  const to = new Date(range.to);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
  return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function suggestGranularity(range: DateRangeValue): ReportGranularity {
  const days = rangeDays(range);
  if (days <= 14) return "day";
  if (days <= 60) return "week";
  return "month";
}

export function formatHumanDate(value: string): string {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatBucketLabel(
  bucket: string,
  granularity: ReportGranularity,
): string {
  if (!bucket) return "";
  const date = new Date(bucket);
  if (Number.isNaN(date.getTime())) return bucket;
  if (granularity === "month") {
    return new Intl.DateTimeFormat("es-EC", { month: "short", year: "2-digit" }).format(date);
  }
  if (granularity === "week") {
    return new Intl.DateTimeFormat("es-EC", { day: "2-digit", month: "short" }).format(date);
  }
  return new Intl.DateTimeFormat("es-EC", { day: "2-digit", month: "short" }).format(date);
}
