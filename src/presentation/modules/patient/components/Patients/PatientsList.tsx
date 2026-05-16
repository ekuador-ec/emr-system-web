import { useState } from "react";
import type { PaginatedResult, PatientListItem } from "@/domain/modules/patient/models/Patient";
import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { useTogglePatientStatus } from "@/presentation/modules/patient/hooks/usePatients";
import {
  WcTables,
  TableActionCell,
} from "@/presentation/modules/shared/components/ui/webcomponents/Tables/wcTables";
import type { WcTableColumn, WcTableRow } from "@/presentation/modules/shared/components/ui/webcomponents/Tables/wcTables";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcTag from "@/presentation/modules/shared/components/ui/webcomponents/Tags/wcTag";
import { useConfirmDialog } from "@/presentation/modules/shared/components/ui/useConfirmDialog";

interface PatientsListProps {
  patientsResult?: PaginatedResult<PatientListItem>;
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

export function PatientsList({ patientsResult }: PatientsListProps) {
  const { setPatientFilters, setSelectedPatientId, setEditingPatientId } = usePatientStore();
  const { mutate: toggleStatus, isPending: isToggling } = useTogglePatientStatus();
  const { addToast } = useToastStore();
  const { confirm, DialogComponent } = useConfirmDialog();
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);

  if (!patientsResult) return null;

  const { data: patients, total, page, limit } = patientsResult;

  const handleToggleStatus = async (params: { id: string; isActive: boolean; fullName: string }) => {
    const { id, isActive, fullName } = params;
    const isConfirmed = await confirm({
      title: isActive ? "Archivar Paciente" : "Activar Paciente",
      message: isActive
        ? `¿Desea archivar al paciente ${fullName}? Su ficha dejará de mostrarse por defecto en listados activos, pero su historial médico se conservará.`
        : `¿Desea activar al paciente ${fullName}? Volverá a estar disponible en los listados principales.`,
      confirmText: isActive ? "Archivar" : "Activar",
      type: isActive ? "danger" : "primary",
    });

    if (!isConfirmed) {
      return;
    }

    setPendingToggleId(id);

    toggleStatus(
      { id, isActive: !isActive },
      {
        onSuccess: () => {
          addToast({
            type: "success",
            message: `Paciente ${!isActive ? "activado" : "archivado"} exitosamente`,
          });
        },
        onError: (err) => {
          addToast({
            type: "error",
            message: `Error al cambiar estado: ${err.message}`,
          });
        },
        onSettled: () => {
          setPendingToggleId(null);
        },
      }
    );
  };

  const columns: WcTableColumn[] = [
    {
      key: "status",
      name: "Estado",
      width: "150px",
      align: "center",
      render: (row) => {
        const isActive = row.isActive === true;
        return (
          <WcTag variant={isActive ? "success" : "warning"} size="sm">
            {isActive ? "Activo" : "Archivado"}
          </WcTag>
        );
      },
    },
    {
      key: "idNumber",
      name: "Cedula / ID",
      align: "center",
      render: (row) =>
        row.idNumberType === 'temporal' ? (
          <span className="patients-id-pending-badge">
            ID Pendiente
          </span>
        ) : (
          <span>{row.idNumber as string}</span>
        ),
    },
    {
      key: "patient",
      name: "Paciente",
      render: (row) => (
        <div className="patients-name-cell">
          <div className="patients-name-cell__title">{row.fullName as string}</div>
          {typeof row.bloodType === "string" && row.bloodType.trim().length > 0 ? (
            <span className="patients-name-cell__subtitle">
              Grupo Sanguineo: {row.bloodType}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: "phone",
      name: "Telefono",
      align: "center",
      render: (row) =>
        row.phone ? (
          <span>{row.phone as string}</span>
        ) : (
          <span className="patients-contact-cell__muted">Sin telefono</span>
        ),
    },
    {
      key: "email",
      name: "Correo",
      align: "center",
      render: (row) =>
        row.email ? (
          <span className="patients-contact-cell__email">{row.email as string}</span>
        ) : (
          <span className="patients-contact-cell__muted">--</span>
        ),
    },
    {
      key: "actions",
      name: "Acciones",
      align: "center",
      render: (row) => {
        const id = row.id as string;
        const isActive = row.isActive as boolean;
        const fullName = row.fullName as string;
        
        return (
          <TableActionCell className="patients-table-action-cell">
            <div className="patients-table-action-group">
              <WcButtonIcon
                variant="terciary"
                shape="square"
                size="sm"
                className="patients-table-action-icon"
                icon="icon-card-info"
                title="Ver Detalles del Paciente"
                aria-label="Ver Detalles del Paciente"
                onClick={() => setSelectedPatientId(id)}
              />
              <WcButtonIcon
                variant="primary"
                shape="square"
                size="sm"
                className="patients-table-action-icon"
                icon="icon-edit"
                title="Editar Paciente"
                aria-label="Editar Paciente"
                onClick={() => setEditingPatientId(id)}
              />
              <WcButtonIcon
                variant={isActive ? "danger" : "primary"}
                shape="square"
                size="sm"
                className="patients-table-action-icon"
                icon={isActive ? "icon-lock" : "icon-activate-solid"}
                title={isActive ? "Archivar paciente" : "Activar paciente"}
                aria-label={isActive ? "Archivar paciente" : "Activar paciente"}
                onClick={() => void handleToggleStatus({ id, isActive, fullName })}
                disabled={isToggling && pendingToggleId === id}
              />
            </div>
          </TableActionCell>
        );
      },
    },
  ];

  const rows: WcTableRow[] = patients.map((patient) => ({
    id: patient.id,
    idNumber: patient.idNumber,
    idNumberType: patient.idNumberType,
    fullName: `${patient.firstName} ${patient.lastName} ${patient.secondLastName || ""}`.trim(),
    bloodType: patient.bloodType,
    phone: patient.phone,
    email: patient.email,
    isActive: patient.isActive,
  }));

  const totalPages = Math.ceil(total / limit);
  const paginationItems = getPaginationItems(totalPages, page);

  return (
    <div className="card patients-list-card" style={{ padding: "0" }}>
      <WcTables
        columns={columns}
        rows={rows}
        emptyMessage="No se encontraron pacientes con los criterios de búsqueda."
        showPagination={false}
      />
      {DialogComponent}
      
      {totalPages > 1 && (
        <div className="wc-tables__footer patients-list-card__footer">
          <span
            className="wc-tables__summary patients-list-card__summary"
          >
            Mostrando {(page - 1) * limit + 1}-{Math.min(page * limit, total)} de {total} registros
          </span>
          <div className="wc-tables__pagination patients-list-card__pagination">
            <WcButton
              variant="primary"
              className="patients-list-card__pagination-btn wc-tables__pagination-btn"
              disabled={page === 1}
              onClick={() => setPatientFilters({ page: page - 1 })}
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
                  className={`patients-list-card__pagination-btn wc-tables__pagination-btn${page === item ? " wc-tables__pagination-btn--active" : ""}`}
                  onClick={() => setPatientFilters({ page: item })}
                  aria-current={page === item ? "page" : undefined}
                >
                  {item}
                </WcButton>
              ),
            )}
            <WcButton
              variant="primary"
              className="patients-list-card__pagination-btn wc-tables__pagination-btn"
              disabled={page === totalPages}
              onClick={() => setPatientFilters({ page: page + 1 })}
              aria-label="Pagina siguiente"
            >
              {">"}
            </WcButton>
          </div>
        </div>
      )}
    </div>
  );
}
