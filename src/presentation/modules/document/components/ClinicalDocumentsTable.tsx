import { useNavigate } from "react-router-dom";
import type {
  ClinicalDocumentListItem,
  PaginatedResult,
} from "@/domain/modules/document/models/ClinicalDocument";
import type { UserRole } from "@/domain/modules/users/models/User";
import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import { useEvolutionUIStore } from "@/presentation/modules/evolution/stores/useEvolutionUIStore";
import { useForm005UIStore } from "@/presentation/modules/form005/stores/useForm005UIStore";
import { getDocumentDefinition } from "@/presentation/modules/document/registry/documentRegistry";
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
import { EvolutionAuditCell } from "@/presentation/modules/evolution/components/list/EvolutionAuditCell";
import "@/presentation/modules/evolution/components/list/EvolutionResultsTable.css";

interface ClinicalDocumentsTableProps {
  result?: PaginatedResult<ClinicalDocumentListItem>;
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

  if (currentPage > 2) items.push("ellipsis");
  if (isCurrentInMiddle) items.push(currentPage);
  if (currentPage < totalPages - 1) items.push("ellipsis");

  items.push(totalPages);
  return items;
}

function getStatusBadge(status: ClinicalDocumentListItem["status"]) {
  if (status === "CERRADA") return { label: "Cerrada", color: "success" as const };
  if (status === "EN_PROCESO") return { label: "En proceso", color: "info" as const };
  return { label: "Abierta", color: "warning" as const };
}

function formatAttentionDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-EC", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function ClinicalDocumentsTable({
  result,
  isLoading = false,
  emptyMessage,
  onPageChange,
}: ClinicalDocumentsTableProps) {
  const navigate = useNavigate();
  const { setSelectedPatientId } = usePatientStore();
  const openReadOnlyEvolution = useEvolutionUIStore((state) => state.openReadOnlyEvolution);
  const openReadOnlyForm005 = useForm005UIStore((state) => state.openReadOnlyForm005);

  if (!result) return null;

  const { data: documents, total, page, limit } = result;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const paginationItems = getPaginationItems(totalPages, page);

  const columns: WcTableColumn[] = [
    {
      key: "documentType",
      name: "Tipo",
      align: "center",
      render: (row) => {
        const def = getDocumentDefinition(row.documentType as ClinicalDocumentListItem["documentType"]);
        return (
          <WcTag variant="neutral" size="sm">
            <Icon name={def.icon} size={12} />
            {def.code}
          </WcTag>
        );
      },
    },
    {
      key: "status",
      name: "Estado",
      align: "center",
      render: (row) => {
        const badge = getStatusBadge(row.status as ClinicalDocumentListItem["status"]);
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
      render: (row) => {
        const dateValue = row.attentionDate as string | null;
        const timeValue = row.attentionTime as string | null;
        if (!dateValue) return <span className="evolution-attention-cell__empty">—</span>;
        return (
          <div className="evolution-attention-cell">
            <Icon name="icon-calendar-solid" size={14} className="evolution-attention-cell__icon" />
            <div className="evolution-attention-cell__text">
              <span className="evolution-attention-cell__date">{formatAttentionDate(dateValue)}</span>
              <span className="evolution-attention-cell__time">
                {timeValue ? timeValue.slice(0, 5) : "—"}
              </span>
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
      render: (row) => {
        const patientId = String(row.patientId ?? "");
        const documentId = String(row.id ?? "");
        const documentType = row.documentType as ClinicalDocumentListItem["documentType"];
        const def = getDocumentDefinition(documentType);

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
              title="Ver detalle (solo lectura)"
              aria-label="Ver detalle (solo lectura)"
              onClick={() => {
                if (documentType === "FORM_005") {
                  openReadOnlyForm005({ patientId, documentId });
                } else {
                  openReadOnlyEvolution({ patientId, evolutionId: documentId });
                }
              }}
            />
            <WcButtonIcon
              variant="secondary"
              shape="square"
              size="md"
              icon="icon-edit"
              className="evolution-table-action-icon"
              title="Editar documento"
              aria-label="Editar documento"
              onClick={() => navigate(def.workspacePath(patientId, documentId))}
            />
          </TableActionCell>
        );
      },
    },
  ];

  const rows: WcTableRow[] = documents.map((doc) => ({
    id: doc.id,
    documentType: doc.documentType,
    status: doc.status,
    patientName: doc.patientName,
    patientIdNumber: doc.patientIdNumber,
    patientId: doc.patientId,
    attentionDate: doc.attentionDate,
    attentionTime: doc.attentionTime,
    openedByName: doc.openedByName,
    openedByRole: doc.openedByRole,
    updatedByName: doc.updatedByName,
    updatedByRole: doc.updatedByRole,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));

  return (
    <div className="card evolution-results-table-card" style={{ padding: "0" }}>
      <WcTables
        columns={columns}
        rows={rows}
        emptyMessage={isLoading ? "Cargando documentos..." : emptyMessage}
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
