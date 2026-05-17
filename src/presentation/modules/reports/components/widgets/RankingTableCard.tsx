import type { ReactNode } from "react";
import "./RankingTableCard.css";

export interface RankingRow {
  id: string;
  label: string;
  sublabel?: string;
  value: number;
  percentage?: number;
}

interface RankingTableCardProps {
  title: string;
  subtitle?: string;
  rows: RankingRow[];
  metricLabel?: string;
  metricFormatter?: (value: number) => string;
  isLoading?: boolean;
  emptyText?: string;
  actions?: ReactNode;
  rankColumn?: boolean;
  percentageColumn?: boolean;
  maxRows?: number;
}

const defaultMetricFormatter = (value: number) =>
  new Intl.NumberFormat("es-EC", { maximumFractionDigits: 0 }).format(value);

export function RankingTableCard({
  title,
  subtitle,
  rows,
  metricLabel = "Total",
  metricFormatter,
  isLoading,
  emptyText = "No hay datos para el rango seleccionado.",
  actions,
  rankColumn = true,
  percentageColumn = true,
  maxRows,
}: RankingTableCardProps) {
  const formatter = metricFormatter ?? defaultMetricFormatter;
  const visibleRows = maxRows ? rows.slice(0, maxRows) : rows;
  const maxValue = visibleRows.reduce((acc, row) => Math.max(acc, row.value), 0);

  return (
    <section className="ranking-table-card">
      <header className="ranking-table-card__header">
        <div>
          <h3 className="ranking-table-card__title">{title}</h3>
          {subtitle ? (
            <p className="ranking-table-card__subtitle">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div>{actions}</div> : null}
      </header>

      {isLoading ? (
        <div className="ranking-table-card__loading">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="ranking-table-card__skeleton-row" style={{ width: `${90 - idx * 10}%` }} />
          ))}
        </div>
      ) : visibleRows.length === 0 ? (
        <div className="ranking-table-card__empty">{emptyText}</div>
      ) : (
        <table className="ranking-table-card__table">
          <thead>
            <tr>
              {rankColumn ? <th>#</th> : null}
              <th>Concepto</th>
              <th aria-hidden="true" />
              <th style={{ textAlign: "right" }}>{metricLabel}</th>
              {percentageColumn ? <th style={{ textAlign: "right" }}>%</th> : null}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => {
              const fillPercent =
                maxValue === 0 ? 0 : Math.max(1, (row.value / maxValue) * 100);
              return (
                <tr key={row.id}>
                  {rankColumn ? (
                    <td className="ranking-table-card__rank">{index + 1}</td>
                  ) : null}
                  <td>
                    <div className="ranking-table-card__main">
                      <span className="ranking-table-card__label" title={row.label}>
                        {row.label}
                      </span>
                      {row.sublabel ? (
                        <span className="ranking-table-card__meta">{row.sublabel}</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="ranking-table-card__bar-cell">
                    <div className="ranking-table-card__bar">
                      <div
                        className="ranking-table-card__bar-fill"
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  </td>
                  <td className="ranking-table-card__metric">
                    {formatter(row.value)}
                  </td>
                  {percentageColumn ? (
                    <td className="ranking-table-card__percentage">
                      {row.percentage !== undefined && row.percentage !== null
                        ? `${row.percentage.toFixed(1)}%`
                        : "-"}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
