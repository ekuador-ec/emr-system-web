import type { ReactNode } from "react";

interface EvolutionPdfCellProps {
  label: string;
  value?: ReactNode;
  span?: number;
  emphasis?: "default" | "strong" | "muted";
  align?: "left" | "center" | "right";
  multiline?: boolean;
  fallback?: string;
}

export function EvolutionPdfCell({
  label,
  value,
  span = 3,
  emphasis = "default",
  align = "left",
  multiline = false,
  fallback = "—",
}: EvolutionPdfCellProps) {
  const isEmpty =
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "");

  const classes = [
    "em-pdf-cell",
    isEmpty ? "em-pdf-cell--empty" : "",
    multiline ? "em-pdf-cell--multiline" : "",
    `em-pdf-cell--align-${align}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={{ gridColumn: `span ${span}` }}>
      <span className="em-pdf-cell__label">{label}</span>
      <span className={`em-pdf-cell__value em-pdf-cell__value--${emphasis}`}>
        {isEmpty ? fallback : value}
      </span>
    </div>
  );
}
