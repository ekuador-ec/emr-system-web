import type { ReactNode } from "react";
import "./ChartCard.css";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  legend?: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyText?: string;
  height?: number;
  children: ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  actions,
  legend,
  isLoading,
  isEmpty,
  emptyText = "No hay datos para el rango seleccionado.",
  height = 280,
  children,
}: ChartCardProps) {
  return (
    <section className="chart-card">
      <header className="chart-card__header">
        <div>
          <h3 className="chart-card__title">{title}</h3>
          {subtitle ? <p className="chart-card__subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div>{actions}</div> : null}
      </header>
      <div className="chart-card__body" style={{ height }}>
        {isLoading ? (
          <div className="chart-card__loading">Cargando informacion...</div>
        ) : isEmpty ? (
          <div className="chart-card__empty">{emptyText}</div>
        ) : (
          children
        )}
      </div>
      {legend ? <div className="chart-card__legend">{legend}</div> : null}
    </section>
  );
}
