import { useMemo, type ReactNode } from "react";
import type { WorkloadHeatmapCell } from "@/domain/modules/reports/models/AdminInsights";
import { chartColorAt } from "./chartPalette";
import "./HeatmapCard.css";

interface HeatmapCardProps {
  title: string;
  subtitle?: string;
  cells: WorkloadHeatmapCell[];
  isLoading?: boolean;
  emptyText?: string;
  actions?: ReactNode;
}

const WEEKDAY_LABELS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function HeatmapCard({
  title,
  subtitle,
  cells,
  isLoading,
  emptyText = "Sin actividad registrada en el rango.",
  actions,
}: HeatmapCardProps) {
  const baseColor = chartColorAt(0);

  const { matrix, max } = useMemo(() => {
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    let maxValue = 0;
    cells.forEach((cell) => {
      const day = cell.weekday >= 1 && cell.weekday <= 7 ? cell.weekday - 1 : 0;
      const hour = cell.hour >= 0 && cell.hour <= 23 ? cell.hour : 0;
      grid[day][hour] = cell.total;
      if (cell.total > maxValue) maxValue = cell.total;
    });
    return { matrix: grid, max: maxValue };
  }, [cells]);

  const isEmpty = !isLoading && max === 0;

  const legendSteps = [0, 0.25, 0.5, 0.75, 1];

  const cellColor = (value: number): string => {
    if (value === 0) return "var(--color-border)";
    const intensity = max === 0 ? 0 : value / max;
    const alpha = 0.15 + intensity * 0.85;
    return hexToRgba(baseColor, alpha);
  };

  return (
    <section className="heatmap-card">
      <header className="heatmap-card__header">
        <div>
          <h3 className="heatmap-card__title">{title}</h3>
          {subtitle ? <p className="heatmap-card__subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div>{actions}</div> : null}
      </header>

      {isLoading ? (
        <div className="heatmap-card__loading">Cargando heatmap...</div>
      ) : isEmpty ? (
        <div className="heatmap-card__empty">{emptyText}</div>
      ) : (
        <>
          <div className="heatmap-card__grid">
            <div className="heatmap-card__row-labels">
              <span aria-hidden="true" />
              {WEEKDAY_LABELS.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <div className="heatmap-card__body">
              <div className="heatmap-card__hour-row" aria-hidden="true">
                {Array.from({ length: 24 }).map((_, hour) => (
                  <span key={hour}>{hour % 3 === 0 ? `${hour}h` : ""}</span>
                ))}
              </div>
              {matrix.map((row, dayIndex) => (
                <div className="heatmap-card__cells-row" key={WEEKDAY_LABELS[dayIndex]}>
                  {row.map((value, hour) => (
                    <div
                      key={`${dayIndex}-${hour}`}
                      className="heatmap-card__cell"
                      style={{ backgroundColor: cellColor(value) }}
                      title={`${WEEKDAY_LABELS[dayIndex]} ${hour
                        .toString()
                        .padStart(2, "0")}:00 - ${value} atenciones`}
                      role="img"
                      aria-label={`${WEEKDAY_LABELS[dayIndex]} ${hour}h: ${value} atenciones`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="heatmap-card__legend">
            <span>Menos</span>
            <div className="heatmap-card__legend-scale">
              {legendSteps.map((step) => (
                <div
                  key={step}
                  className="heatmap-card__legend-scale-step"
                  style={{
                    backgroundColor:
                      step === 0
                        ? "var(--color-border)"
                        : hexToRgba(baseColor, 0.15 + step * 0.85),
                  }}
                />
              ))}
            </div>
            <span>Mas</span>
            <span style={{ marginLeft: "auto" }}>
              Pico: <strong style={{ color: "var(--color-text)" }}>{max}</strong> atenciones / hora
            </span>
          </div>
        </>
      )}
    </section>
  );
}
