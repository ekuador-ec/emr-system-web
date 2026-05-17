import type { ReactNode } from "react";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import "./KpiCard.css";

interface KpiCardProps {
  label: string;
  value: number | string | null | undefined;
  icon?: string;
  hint?: string;
  delta?: number | null;
  deltaSuffix?: string;
  isLoading?: boolean;
  format?: (value: number) => string;
  trailing?: ReactNode;
}

const defaultFormatter = (value: number) =>
  new Intl.NumberFormat("es-EC", { maximumFractionDigits: 1 }).format(value);

function computeDelta(current?: number | null, previous?: number | null) {
  if (current === null || current === undefined) return null;
  if (previous === null || previous === undefined) return null;
  if (previous === 0) {
    if (current === 0) return 0;
    return null;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function KpiCard({
  label,
  value,
  icon,
  hint,
  delta,
  deltaSuffix = "vs periodo previo",
  isLoading,
  format,
  trailing,
}: KpiCardProps) {
  const formatter = format ?? defaultFormatter;
  const numericValue =
    typeof value === "number" ? value : value !== null && value !== undefined && !Number.isNaN(Number(value)) ? Number(value) : null;

  const renderedValue = (() => {
    if (isLoading) {
      return <div className="kpi-card__skeleton" style={{ width: "60%" }} />;
    }
    if (value === null || value === undefined) {
      return <span className="kpi-card__value">--</span>;
    }
    if (typeof value === "string") {
      return <span className="kpi-card__value">{value}</span>;
    }
    return <span className="kpi-card__value">{formatter(value)}</span>;
  })();

  const deltaClass = (() => {
    if (delta === null || delta === undefined || Number.isNaN(delta)) return null;
    if (delta > 0) return "kpi-card__delta--up";
    if (delta < 0) return "kpi-card__delta--down";
    return "kpi-card__delta--neutral";
  })();

  const deltaText = (() => {
    if (delta === null || delta === undefined || Number.isNaN(delta)) return null;
    const sign = delta > 0 ? "+" : "";
    return `${sign}${delta.toFixed(1)}%`;
  })();

  return (
    <article className="kpi-card" aria-label={label}>
      <div className="kpi-card__header">
        <span className="kpi-card__label">{label}</span>
        {icon ? (
          <span className="kpi-card__icon" aria-hidden="true">
            <Icon name={icon} size={20} />
          </span>
        ) : null}
      </div>
      {renderedValue}
      {numericValue !== null && deltaText && deltaClass ? (
        <span className={`kpi-card__delta ${deltaClass}`}>
          {deltaText} <span style={{ fontWeight: "var(--font-weight-regular)", opacity: 0.8 }}>{deltaSuffix}</span>
        </span>
      ) : null}
      {hint ? <p className="kpi-card__hint">{hint}</p> : null}
      {trailing}
    </article>
  );
}

KpiCard.computeDelta = computeDelta;
