import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import "@/presentation/modules/shared/components/ui/webcomponents/Tables/wcTables.css";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";

export function TableAvatarCell({
  avatarUrl,
  title,
  subtitle,
}: {
  avatarUrl?: string;
  title: string;
  subtitle?: string;
}) {
  const fallback = title.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="wc-tables__avatar-cell">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={title}
          className="wc-tables__avatar"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="wc-tables__avatar wc-tables__avatar--fallback">{fallback}</div>
      )}
      <div className="wc-tables__avatar-info">
        <span className="wc-tables__avatar-title">{title}</span>
        {subtitle ? <span className="wc-tables__avatar-subtitle">{subtitle}</span> : null}
      </div>
    </div>
  );
}

export function TableStatusBadge({
  status,
  label,
  color,
}: {
  status: string;
  label: string;
  color?: "success" | "danger" | "warning" | "info";
}) {
  return <span className={`wc-tables__badge wc-tables__badge--${color ?? status}`}>{label}</span>;
}

export function TableActionCell({ children }: { children: ReactNode }) {
  return <div className="wc-tables__action-cell">{children}</div>;
}

export function TableIconButton({
  children,
  onClick,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <WcButtonIcon
      variant="secondary"
      shape="square"
      size="sm"
      className="wc-tables__icon-button"
      onClick={onClick}
      title={title}
    >
      {children}
    </WcButtonIcon>
  );
}

export interface WcTableColumn {
  key: string;
  name: string;
  align?: "left" | "center" | "right";
  width?: string;
  sortable?: boolean;
  render?: (row: WcTableRow) => ReactNode;
}

export type WcTableRow = Record<string, string | number | boolean | null | undefined>;

export interface WcTablesProps {
  columns: WcTableColumn[];
  rows: WcTableRow[];
  emptyMessage?: string;
  className?: string;
  pageSize?: number;
  showPagination?: boolean;
  rowKey?: string;
}

function normalizeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function getRowIdentifier(row: WcTableRow, index: number, rowKey: string): string {
  const raw = row[rowKey];

  if (typeof raw === "string" || typeof raw === "number") {
    return String(raw);
  }

  return `row-${index}`;
}

function getPaginationItems(totalPages: number, currentPage: number): Array<number | "ellipsis"> {
  if (totalPages <= 2) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1];
  const isCurrentInMiddle = currentPage > 1 && currentPage < totalPages;

  if (currentPage > 2) {
    items.push("ellipsis");
  }

  if (isCurrentInMiddle) {
    items.push(currentPage);
  }

  if (currentPage < totalPages - 1) {
    items.push("ellipsis");
  }

  items.push(totalPages);

  return items;
}

export function WcTables({
  columns,
  rows,
  emptyMessage = "No hay resultados",
  className,
  pageSize = 10,
  showPagination = true,
  rowKey = "id",
}: WcTablesProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = totalRows === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const pageEnd = totalRows === 0 ? 0 : Math.min(safePage * pageSize, totalRows);

  const paginatedRows = useMemo(
    () => rows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [rows, safePage, pageSize],
  );

  const pageRowsWithIds = useMemo(
    () => paginatedRows.map((row, index) => ({ row, id: getRowIdentifier(row, index, rowKey) })),
    [paginatedRows, rowKey],
  );

  useEffect(() => {
    setCurrentPage((previous) => Math.min(previous, totalPages));
  }, [totalPages]);

  const paginationItems = getPaginationItems(totalPages, safePage);

  return (
    <div className={["wc-tables", className].filter(Boolean).join(" ")}>
      <div className="wc-tables__scroll">
        <table className="wc-tables__table">
          <thead>
            <tr className="wc-tables__header-row">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="wc-tables__header-cell"
                  style={{ textAlign: "center", width: column.width }}
                >
                  <span className="wc-tables__header-label">{column.name}</span>
                  {column.sortable ? <span className="wc-tables__sort-indicator">▼</span> : null}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {pageRowsWithIds.length > 0 ? (
              pageRowsWithIds.map(({ row, id }, index) => (
                <tr key={id} className="wc-tables__body-row">
                  {columns.map((column) => (
                    <td
                      key={`${id}-${column.key}`}
                      className="wc-tables__body-cell"
                      style={{ textAlign: column.align ?? "left" }}
                      data-row-index={index}
                    >
                      {column.render ? column.render(row) : normalizeValue(row[column.key]) || "--"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr className="wc-tables__empty-row">
                <td className="wc-tables__empty-cell" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showPagination ? (
        <div className="wc-tables__footer">
          <p className="wc-tables__summary">{`Mostrando ${pageStart}-${pageEnd} de ${totalRows} registros`}</p>

          <div className="wc-tables__pagination">
            <WcButton
              variant="primary"
              className="wc-tables__pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={safePage === 1}
              aria-label="Pagina anterior"
            >
              {"<"}
            </WcButton>

            {paginationItems.map((item, index) =>
              item === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="wc-tables__pagination-ellipsis">
                  ...
                </span>
              ) : (
                <WcButton
                  variant={safePage === item ? "primary" : "secondary"}
                  key={`page-${item}`}
                  className={`wc-tables__pagination-btn${safePage === item ? " wc-tables__pagination-btn--active" : ""}`}
                  onClick={() => setCurrentPage(item)}
                >
                  {item}
                </WcButton>
              ),
            )}

            <WcButton
              variant="primary"
              className="wc-tables__pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safePage === totalPages}
              aria-label="Pagina siguiente"
            >
              {">"}
            </WcButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
