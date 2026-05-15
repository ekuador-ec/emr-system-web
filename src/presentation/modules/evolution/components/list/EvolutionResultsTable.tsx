import { useNavigate } from "react-router-dom";
import type {
  PaginatedResult,
  MedicalEvolutionListItem,
} from "@/domain/modules/evolution/models/Evolution";
import type { UserRole } from "@/domain/modules/users/models/User";
import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import { useEvolutionUIStore } from "@/presentation/modules/evolution/stores/useEvolutionUIStore";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import {
  WcTables,
  TableActionCell,
  TableAvatarCell,
  TableStatusBadge,
} from "@/presentation/modules/shared/components/ui/webcomponents/Tables/wcTables";
import type {
  WcTableColumn,
  WcTableRow,
} from "@/presentation/modules/shared/components/ui/webcomponents/Tables/wcTables";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { EvolutionAuditCell } from "./EvolutionAuditCell";
import "./EvolutionResultsTable.css";

interface EvolutionResultsTableProps {
  result?: PaginatedResult<MedicalEvolutionListItem>;
  isLoading?: boolean;
  emptyMessage: string;
  onPageChange: (page: number) => void;
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
  const openReadOnlyEvolution = useEvolutionUIStore(
    (state) => state.openReadOnlyEvolution,
  );

  if (!result) {
    return null;
  }

  const { data: evolutions, total, page, limit } = result;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const pageEnd = total === 0 ? 0 : Math.min(page * limit, total);

  const columns: WcTableColumn[] = [
    {
      key: "status",
      name: "Estado",
      align: "center",
      width: "120px",
      render: (row) => {
        const badge = getStatusBadge(row.status as MedicalEvolutionListItem["status"]);

        return <TableStatusBadge status={badge.color} label={badge.label} color={badge.color} />;
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
      width: "180px",
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
            <Icon
              name="icon-calendar-solid"
              size={14}
              className="evolution-attention-cell__icon"
            />
            <div className="evolution-attention-cell__text">
              <span className="evolution-attention-cell__date">{dateLabel}</span>
              {timeLabel ? (
                <span className="evolution-attention-cell__time">{timeLabel}</span>
              ) : null}
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
      width: "184px",
      render: (row) => {
        const patientId = String(row.patientId ?? "");
        const evolutionId = String(row.id ?? "");

        return (
          <TableActionCell>
            <WcButtonIcon
              variant="terciary"
              shape="square"
              size="sm"
              icon="icon-open-folder"
              title="Ver historia clínica"
              aria-label="Ver historia clínica"
              onClick={() => navigate(`/pacientes/${patientId}/historia`)}
            />
            <WcButtonIcon
              variant="terciary"
              shape="square"
              size="sm"
              icon="icon-eye"
              title="Ver detalle (solo lectura)"
              aria-label="Ver detalle (solo lectura)"
              onClick={() =>
                openReadOnlyEvolution({ patientId, evolutionId })
              }
            />
            <WcButtonIcon
              variant="terciary"
              shape="square"
              size="sm"
              icon="icon-edit"
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
    <div
      className="card"
      style={{ padding: "0", display: "flex", flexDirection: "column", gap: "0", position: "relative" }}
    >
      {isLoading ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
            overflow: "hidden",
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, transparent, var(--color-primary), transparent)",
              animation: "evolutionTableLoadingBar 1.2s ease-in-out infinite",
            }}
          />
        </div>
      ) : null}
      <div
        style={{
          padding: "var(--space-4) var(--space-5)",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "var(--space-3)",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-secondary)",
            }}
          >
            {total === 0
              ? "No hay resultados para el filtro actual."
              : `Mostrando ${pageStart}-${pageEnd} de ${total} evoluciones.`}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            color: "var(--color-text-secondary)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          <Icon name="icon-clipboard" size={14} />
          <span>
            {total} registro{total === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <WcTables columns={columns} rows={rows} emptyMessage={emptyMessage} showPagination={false} />

      {totalPages > 1 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "var(--space-4) var(--space-5)",
            borderTop: "1px solid var(--color-border)",
            flexWrap: "wrap",
            gap: "var(--space-3)",
          }}
        >
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
            Página {page} de {totalPages}
          </span>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
            <WcButton
              variant="secondary"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
            >
              Anterior
            </WcButton>
            <WcButton
              variant="secondary"
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Siguiente
            </WcButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
