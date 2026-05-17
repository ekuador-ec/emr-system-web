export type CsvCellValue = string | number | boolean | null | undefined;

export interface CsvColumn<T> {
  header: string;
  accessor: (row: T) => CsvCellValue;
}

const BOM = "\uFEFF";

function escapeCell(value: CsvCellValue): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\r\n;]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function rowsToCsv<T>(rows: T[], columns: Array<CsvColumn<T>>): string {
  const header = columns.map((c) => escapeCell(c.header)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escapeCell(c.accessor(row))).join(","))
    .join("\r\n");
  return `${header}\r\n${body}`;
}

function safeFilename(name: string): string {
  return name.replace(/[^a-z0-9_\-.]+/gi, "_");
}

function buildTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(
    now.getHours(),
  )}${pad(now.getMinutes())}`;
}

export function downloadCsv<T>(
  rows: T[],
  columns: Array<CsvColumn<T>>,
  filenameBase: string,
): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (!rows || rows.length === 0) return;

  const csv = rowsToCsv(rows, columns);
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeFilename(filenameBase)}_${buildTimestamp()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
