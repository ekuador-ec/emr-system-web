import { useNavigate } from "react-router-dom";
import type {
  PaginatedResult,
  MedicalEvolutionListItem,
} from "@/domain/modules/evolution/models/Evolution";
import type { UserRole } from "@/domain/modules/users/models/User";
import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import {
  WcTables,
  TableActionCell,
  TableAvatarCell,
} from "@/presentation/modules/shared/components/ui/webcomponents/Tables/wcTables";
import type {
  WcTableColumn,
  WcTableRow,
} from "@/presentation/modules/shared/components/ui/webcomponents/Tables/wcTables";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcTag from "@/presentation/modules/shared/components/ui/webcomponents/Tags/wcTag";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { EvolutionAuditCell } from "./EvolutionAuditCell";
import "./EvolutionResultsTable.css";

interface EvolutionResultsTableProps {
  result?: PaginatedResult<MedicalEvolutionListItem>;
  isLoading?: boolean;
  emptyMessage: string;
  onPageChange: (page: number) => void;
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

function getStatusBadge(status: MedicalEvolutionListItem["status"]) {
  if (status === "CERRADA") {
    return { label: "Cerrada", color: "success" as const };
  }

  if (status === "EN_PROCESO") {
    return { label: "En proceso", color: "info" as const };
  }

  return { label: "Abierta", color: "warning" as const };
}

function formatAttentionDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatAttentionTime(value: string | null): string | null {
  if (!value) return null;
  return value.slice(0, 5);
}

export function EvolutionResultsTable({
  result,
  isLoading = false,
  emptyMessage,
  onPageChange,
}: EvolutionResultsTableProps) {
  const navigate = useNavigate();
  const { setSelectedPatientId } = usePatientStore();

  if (!result) {
    return null;
  }

  const { data: evolutions, total, page, limit } = result;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const paginationItems = getPaginationItems(totalPages, page);

  const columns: WcTableColumn[] = [
    {
      key: "status",
      name: "Estado",
      align: "center",
      width: "var(--evolution-col-status-width)",
      render: (row) => {
        const badge = getStatusBadge(row.status as MedicalEvolutionListItem["status"]);

        return (
          <WcTag variant={badge.color} size="sm">
            {badge.label}
          </WcTag>
        );
      },
    },
    {
      key: "patient",
      name: "Paciente",
      render: (row) => {
        const patientId = String(row.patientId ?? "");

        return (
          <div className="evolution-patient-cell">
            <TableAvatarCell
              title={String(row.patientName ?? "")}
              subtitle={`Cédula: ${String(row.patientIdNumber ?? "")}`}
            />
            <WcButtonIcon
              variant="terciary"
              shape="square"
              size="sm"
              icon="icon-card-info"
              title="Ver detalle del paciente"
              aria-label="Ver detalle del paciente"
              className="evolution-patient-cell__action"
              onClick={() => setSelectedPatientId(patientId)}
            />
          </div>
        );
      },
    },
    {
      key: "attention",
      name: "Atención",
      align: "center",
      width: "var(--evolution-col-attention-width)",
      render: (row) => {
        const dateValue = row.attentionDate as string | null;
        const timeValue = row.attentionTime as string | null;

        if (!dateValue) {
          return <span className="evolution-attention-cell__empty">—</span>;
        }

        const dateLabel = formatAttentionDate(dateValue);
        const timeLabel = formatAttentionTime(timeValue);

        return (
          <div className="evolution-attention-cell">
            <Icon name="icon-calendar-solid" size={14} className="evolution-attention-cell__icon" />
            <div className="evolution-attention-cell__text">
              <span className="evolution-attention-cell__date">{dateLabel}</span>
              <span className="evolution-attention-cell__time">{timeLabel ?? "—"}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "openedBy",
      name: "Abierta",
      render: (row) => (
        <EvolutionAuditCell
          name={(row.openedByName as string | null) ?? null}
          role={(row.openedByRole as UserRole | null) ?? null}
          timestamp={(row.createdAt as string | null) ?? null}
        />
      ),
    },
    {
      key: "updatedBy",
      name: "Última edición",
      render: (row) => (
        <EvolutionAuditCell
          name={(row.updatedByName as string | null) ?? null}
          role={(row.updatedByRole as UserRole | null) ?? null}
          timestamp={(row.updatedAt as string | null) ?? null}
        />
      ),
    },
    {
      key: "actions",
      name: "Acciones",
      align: "center",
      width: "var(--evolution-col-actions-width)",
      render: (row) => {
        const patientId = String(row.patientId ?? "");
        const evolutionId = String(row.id ?? "");

        return (
          <TableActionCell className="evolution-table-action-cell">
            <WcButtonIcon
              variant="secondary"
              shape="square"
              size="md"
              icon="icon-open-folder"
              className="evolution-table-action-icon"
              title="Ver historia clínica"
              aria-label="Ver historia clínica"
              onClick={() => navigate(`/pacientes/${patientId}/historia`)}
            />
            <WcButtonIcon
              variant="secondary"
              shape="square"
              size="md"
              icon="icon-eye"
              className="evolution-table-action-icon"
              title="Vista de solo lectura (próximamente)"
              aria-label="Vista de solo lectura (próximamente)"
              disabled
            />
            <WcButtonIcon
              variant="secondary"
              shape="square"
              size="md"
              icon="icon-edit"
              className="evolution-table-action-icon"
              title="Editar evolución"
              aria-label="Editar evolución"
              onClick={() =>
                navigate(`/pacientes/${patientId}/historia/evoluciones/${evolutionId}`)
              }
            />
            <WcButtonIcon
              variant="secondary"
              shape="square"
              size="md"
              icon="icon-generate-pdf"
              className="evolution-table-action-icon"
              title="PDF próximamente"
              aria-label="PDF próximamente"
              disabled
            />
          </TableActionCell>
        );
      },
    },
  ];

  const rows: WcTableRow[] = evolutions.map((evolution) => ({
    id: evolution.id,
    status: evolution.status,
    patientName: evolution.patientName,
    patientIdNumber: evolution.patientIdNumber,
    patientId: evolution.patientId,
    attentionDate: evolution.attentionDate,
    attentionTime: evolution.attentionTime,
    openedByName: evolution.openedByName,
    openedByRole: evolution.openedByRole,
    updatedByName: evolution.updatedByName,
    updatedByRole: evolution.updatedByRole,
    createdAt: evolution.createdAt,
    updatedAt: evolution.updatedAt,
  }));

  return (
    <div className="card evolution-results-table-card" style={{ padding: "0" }}>
      <WcTables
        columns={columns}
        rows={rows}
        emptyMessage={isLoading ? "Cargando evoluciones..." : emptyMessage}
        showPagination={false}
      />
      {totalPages > 1 ? (
        <div className="wc-tables__footer evolution-results-table-card__footer">
          <span className="wc-tables__summary evolution-results-table-card__summary">
            Mostrando {(page - 1) * limit + 1}-{Math.min(page * limit, total)} de {total} registros
          </span>
          <div className="wc-tables__pagination evolution-results-table-card__pagination">
            <WcButton
              variant="primary"
              className="wc-tables__pagination-btn evolution-results-table-card__pagination-btn"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
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
                  variant={page === item ? "primary" : "secondary"}
                  key={`page-${item}`}
                  className={`wc-tables__pagination-btn evolution-results-table-card__pagination-btn${page === item ? " wc-tables__pagination-btn--active" : ""}`}
                  onClick={() => onPageChange(item)}
                  aria-current={page === item ? "page" : undefined}
                >
                  {item}
                </WcButton>
              ),
            )}
            <WcButton
              variant="primary"
              className="wc-tables__pagination-btn evolution-results-table-card__pagination-btn"
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
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
