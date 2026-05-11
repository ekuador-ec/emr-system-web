import { useState } from "react";
import type { ReactNode } from "react";
import type { PaginatedResult, PatientListItem } from "@/domain/modules/patient/models/Patient";
import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { useTogglePatientStatus } from "@/presentation/modules/patient/hooks/usePatients";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import {
  WcTables,
  TableActionCell,
  TableStatusBadge,
} from "@/presentation/modules/shared/components/ui/webcomponents/Tables/wcTables";
import type { WcTableColumn, WcTableRow } from "@/presentation/modules/shared/components/ui/webcomponents/Tables/wcTables";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";

interface PatientsListProps {
  patientsResult?: PaginatedResult<PatientListItem>;
}

export function PatientsList({ patientsResult }: PatientsListProps) {
  const { setPatientFilters, setSelectedPatientId, setEditingPatientId } = usePatientStore();
  const { mutate: toggleStatus, isPending: isToggling } = useTogglePatientStatus();
  const { addToast } = useToastStore();

  const [confirmStatus, setConfirmStatus] = useState<{ id: string; isActive: boolean; fullName: string } | null>(null);

  if (!patientsResult) return null;

  const { data: patients, total, page, limit } = patientsResult;

  const handleConfirmToggleStatus = () => {
    if (!confirmStatus) return;
    const { id, isActive } = confirmStatus;

    toggleStatus(
      { id, isActive: !isActive },
      {
        onSuccess: () => {
          addToast({
            type: "success",
            message: `Paciente ${!isActive ? "activado" : "archivado"} exitosamente`,
          });
          setConfirmStatus(null);
        },
        onError: (err) => {
          addToast({
            type: "error",
            message: `Error al cambiar estado: ${err.message}`,
          });
          setConfirmStatus(null);
        }
      }
    );
  };

  const columns: WcTableColumn[] = [
    {
      key: "status",
      name: "Estado",
      align: "center",
      render: (row) => (
        <TableStatusBadge
          status={row.isActive ? "success" : "warning"}
          label={row.isActive ? "Activo" : "Archivado"}
          color={row.isActive ? "success" : "warning"}
        />
      ),
    },
    {
      key: "idNumber",
      name: "Cedula / ID",
      align: "center",
      render: (row) =>
        row.idNumberType === 'temporal' ? (
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-warning)",
              backgroundColor: "var(--color-warning-light)",
              border: "1px solid var(--color-warning)",
              borderRadius: "var(--radius-sm)",
              padding: "2px 8px",
              whiteSpace: "nowrap",
            }}
          >
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
        <div>
          <div style={{ fontWeight: "var(--font-weight-medium)" }}>
            {row.fullName as string}
          </div>
          {row.bloodType && (
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
              Grupo Sanguíneo: {row.bloodType as string}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "contact",
      name: "Contacto",
      align: "center",
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "center" }}>
          {row.phone ? <span>{row.phone as string}</span> : <span style={{ color: "var(--color-text-tertiary)" }}>Sin teléfono</span>}
          {row.email ? <span style={{ color: "var(--color-text-secondary)" }}>{row.email as string}</span> : null}
        </div>
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
          <TableActionCell>
            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", justifyContent: "center" }}>
              <WcButtonIcon
                variant="terciary"
                shape="square"
                size="sm"
                icon="icon-card-info"
                title="Ver Detalles del Paciente"
                aria-label="Ver Detalles del Paciente"
                onClick={() => setSelectedPatientId(id)}
              />
              <WcButtonIcon
                variant="terciary"
                shape="square"
                size="sm"
                icon="icon-edit"
                title="Editar Paciente"
                aria-label="Editar Paciente"
                onClick={() => setEditingPatientId(id)}
              />
              <WcButton
                variant={isActive ? "danger" : "secondary"}
                onClick={() => setConfirmStatus({ id, isActive, fullName })}
                disabled={isToggling && confirmStatus?.id === id}
                style={{ fontSize: "var(--font-size-xs)", padding: "var(--space-1) var(--space-2)" }}
              >
                {isActive ? "Archivar" : "Activar"}
              </WcButton>
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

  return (
    <div className="card" style={{ padding: "0" }}>
      <WcTables
        columns={columns}
        rows={rows}
        emptyMessage="No se encontraron pacientes con los criterios de búsqueda."
        showPagination={false}
      />
      
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "var(--space-4)",
            borderTop: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-primary)",
            borderBottomLeftRadius: "var(--radius-lg)",
            borderBottomRightRadius: "var(--radius-lg)",
          }}
        >
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
            Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total} resultados
          </span>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
            <WcButton
              variant="secondary"
              disabled={page === 1}
              onClick={() => setPatientFilters({ page: page - 1 })}
              style={{ fontSize: "var(--font-size-sm)", padding: "var(--space-2) var(--space-4)" }}
            >
              Anterior
            </WcButton>
            <span style={{ 
              padding: "0 var(--space-2)", 
              fontSize: "var(--font-size-sm)", 
              fontWeight: "var(--font-weight-medium)",
              color: "var(--color-text-primary)"
            }}>
              Página {page} de {totalPages}
            </span>
            <WcButton
              variant="secondary"
              disabled={page === totalPages}
              onClick={() => setPatientFilters({ page: page + 1 })}
              style={{ fontSize: "var(--font-size-sm)", padding: "var(--space-2) var(--space-4)" }}
            >
              Siguiente
            </WcButton>
          </div>
        </div>
      )}

      {confirmStatus && (
        <ConfirmActionModal
          variant={confirmStatus.isActive ? "danger" : "primary"}
          title={confirmStatus.isActive ? "Confirmar Archivado" : "Confirmar Activación"}
          message={
            <>
              ¿Estás seguro de que deseas {confirmStatus.isActive ? "archivar" : "activar"} al paciente{" "}
              <strong style={{ color: "var(--color-text)" }}>{confirmStatus.fullName}</strong>?
            </>
          }
          detail={
            confirmStatus.isActive
              ? "Al archivar al paciente, su ficha clínica dejará de estar visible por defecto en los listados activos, pero su historial médico se conservará intacto en el sistema de manera segura."
              : "Al activar al paciente, volverá a estar disponible en los listados principales para su gestión y asignación de atenciones médicas."
          }
          confirmLabel={confirmStatus.isActive ? "Sí, Archivar" : "Sí, Activar"}
          loadingLabel={confirmStatus.isActive ? "Archivando..." : "Activando..."}
          isLoading={isToggling}
          onConfirm={handleConfirmToggleStatus}
          onCancel={() => setConfirmStatus(null)}
        />
      )}
    </div>
  );
}

type ConfirmActionModalProps = {
  variant: "danger" | "primary";
  title: string;
  message: ReactNode;
  detail: string;
  confirmLabel: string;
  loadingLabel: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmActionModal(props: ConfirmActionModalProps) {
  const confirmVariant = props.variant === "danger" ? "danger" : "primary";
  const titleColor =
    props.variant === "danger" ? "var(--color-danger)" : "var(--color-primary)";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "var(--space-4)",
      }}
      onClick={props.onCancel}
    >
      <div
        className="card"
        style={{ maxWidth: "480px", width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            marginBottom: "var(--space-3)",
            color: titleColor,
          }}
        >
          {props.title}
        </h3>
        <p style={{ marginBottom: "var(--space-2)" }}>
          {props.message}
        </p>
        <p
          style={{
            marginBottom: "var(--space-6)",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-secondary)",
          }}
        >
          {props.detail}
        </p>
        <div
          style={{
            display: "flex",
            gap: "var(--space-3)",
            justifyContent: "flex-end",
          }}
        >
          <WcButton
            variant="terciary"
            onClick={props.onCancel}
            disabled={props.isLoading}
          >
            <Icon name="icon-x" size={14} />
            Cancelar
          </WcButton>
          <WcButton
            variant={confirmVariant}
            onClick={props.onConfirm}
            disabled={props.isLoading}
          >
            <Icon name="icon-check" size={14} />
            {props.isLoading ? props.loadingLabel : props.confirmLabel}
          </WcButton>
        </div>
      </div>
    </div>
  );
}
