import type { ClinicianProductivityRow } from "@/domain/modules/reports/models/AdminInsights";
import { USER_ROLE_LABELS } from "@/domain/modules/users/models/User";
import "./ProductivityTable.css";

interface ProductivityTableProps {
  rows: ClinicianProductivityRow[];
  isLoading?: boolean;
  emptyText?: string;
}

function initials(fullName: string): string {
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatMinutes(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "--";
  if (value < 60) return `${value.toFixed(0)} min`;
  const hours = value / 60;
  if (hours < 24) return `${hours.toFixed(1)} h`;
  return `${(hours / 24).toFixed(1)} d`;
}

function formatRelativeDate(iso: string | null): string {
  if (!iso) return "Sin actividad";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Sin actividad";
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Hace instantes";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH} h`;
  const diffDays = Math.floor(diffH / 24);
  if (diffDays < 30) return `Hace ${diffDays} d`;
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function ProductivityTable({ rows, isLoading, emptyText }: ProductivityTableProps) {
  const maxOpened = rows.reduce((acc, row) => Math.max(acc, row.evolutionsOpened), 0);
  const maxClosed = rows.reduce((acc, row) => Math.max(acc, row.evolutionsClosed), 0);

  if (isLoading) {
    return (
      <div className="productivity-table">
        <div className="productivity-table__loading">Cargando productividad del equipo...</div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="productivity-table">
        <div className="productivity-table__empty">
          {emptyText ?? "Sin actividad clinica en el rango seleccionado."}
        </div>
      </div>
    );
  }

  return (
    <div className="productivity-table">
      <div className="productivity-table__header">
        <div>
          <h3 className="productivity-table__title">Ranking de productividad</h3>
          <p className="productivity-table__subtitle">
            Ordenado por evoluciones cerradas y abiertas en el rango seleccionado.
          </p>
        </div>
      </div>

      <div className="productivity-table__scroll">
        <table className="productivity-table__inner">
          <thead>
            <tr>
              <th>#</th>
              <th>Clinico</th>
              <th className="productivity-table__metric-cell" style={{ textAlign: "right" }}>
                Abiertas
              </th>
              <th className="productivity-table__metric-cell" style={{ textAlign: "right" }}>
                Cerradas
              </th>
              <th style={{ textAlign: "right" }}>Tiempo cierre</th>
              <th style={{ textAlign: "right" }}>Diagnosticos</th>
              <th style={{ textAlign: "right" }}>Ultima actividad</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const openedFill =
                maxOpened === 0 ? 0 : Math.max(2, (row.evolutionsOpened / maxOpened) * 100);
              const closedFill =
                maxClosed === 0 ? 0 : Math.max(2, (row.evolutionsClosed / maxClosed) * 100);
              return (
                <tr key={row.userId}>
                  <td
                    className={`productivity-table__rank${index < 3 ? " productivity-table__rank-top" : ""}`}
                  >
                    {index + 1}
                  </td>
                  <td>
                    <div className="productivity-table__user">
                      <span className="productivity-table__avatar" aria-hidden="true">
                        {initials(row.fullName)}
                      </span>
                      <div className="productivity-table__user-info">
                        <span className="productivity-table__name" title={row.fullName}>
                          {row.fullName}
                        </span>
                        <span className="productivity-table__role">
                          {USER_ROLE_LABELS[row.role]}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="productivity-table__numeric">{row.evolutionsOpened}</div>
                    <div className="productivity-table__bar">
                      <div
                        className="productivity-table__bar-fill"
                        style={{ width: `${openedFill}%` }}
                      />
                    </div>
                  </td>
                  <td>
                    <div className="productivity-table__numeric">{row.evolutionsClosed}</div>
                    <div className="productivity-table__bar">
                      <div
                        className="productivity-table__bar-fill productivity-table__bar-fill--success"
                        style={{ width: `${closedFill}%` }}
                      />
                    </div>
                  </td>
                  <td className="productivity-table__numeric">
                    {formatMinutes(row.avgCloseMinutes)}
                  </td>
                  <td className="productivity-table__numeric">{row.diagnosesCount}</td>
                  <td className="productivity-table__meta">
                    {formatRelativeDate(row.lastActivity)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
