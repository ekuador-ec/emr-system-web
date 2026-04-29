import { useNavigate } from "react-router-dom";
import type {
  PaginatedResult,
  MedicalRecordListItem,
} from "@/domain/modules/medical-record/models/MedicalRecord";
import { useMedicalRecordStore } from "@/presentation/modules/medical-record/stores/useMedicalRecordStore";
import { useUpdateMedicalRecordStatus } from "@/presentation/modules/medical-record/hooks/useMedicalRecord";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { canChangeMedicalRecordStatus } from "@/presentation/core/security/medicalRecordPermissions";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import {
  WcTables,
  TableAvatarCell,
  TableActionCell,
  TableStatusBadge,
} from "@/presentation/modules/shared/components/ui/webcomponents/Tables/wcTables";
import type {
  WcTableColumn,
  WcTableRow,
} from "@/presentation/modules/shared/components/ui/webcomponents/Tables/wcTables";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import { useConfirmDialog } from "@/presentation/modules/shared/components/ui/useConfirmDialog";

interface MedicalRecordsListProps {
  result?: PaginatedResult<MedicalRecordListItem>;
  onSelectRecord: (record: MedicalRecordListItem) => void;
}

export function MedicalRecordsList({ result, onSelectRecord }: MedicalRecordsListProps) {
  const navigate = useNavigate();
  const { setFilters } = useMedicalRecordStore();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateMedicalRecordStatus();
  const { confirm, DialogComponent } = useConfirmDialog();
  const { addToast } = useToastStore();
  const { user } = useAuth();

  const canAdmin = canChangeMedicalRecordStatus(user?.role);

  if (!result) return null;

  const { data: records, total, page, limit } = result;
  const totalPages = Math.ceil(total / limit);

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
  };

  const handleToggleStatus = async (record: MedicalRecordListItem) => {
    const id = String(record.id ?? "");
    const currentStatus = record.isActive === true;

    const isConfirmed = await confirm({
      title: currentStatus ? "Archivar Historia Clínica" : "Activar Historia Clínica",
      message: `¿Desea ${currentStatus ? "archivar" : "activar"} la historia clínica de ${record.patientName ?? "este paciente"}?`,
      confirmText: currentStatus ? "Archivar" : "Activar",
      type: currentStatus ? "danger" : "primary",
    });

    if (!isConfirmed) return;

    updateStatus(
      { id, isActive: !currentStatus },
      {
        onSuccess: () => {
          addToast({
            type: "success",
            message: `Historia Clínica ${!currentStatus ? "activada" : "archivada"} exitosamente`,
          });
        },
        onError: (err) => {
          addToast({
            type: "error",
            message: `Error al cambiar estado: ${err.message}`,
          });
        },
      },
    );
  };

  const columns: WcTableColumn[] = [
    {
      key: "status",
      name: "Estado",
      align: "center",
      render: (row) => {
        const isActive = row.isActive === true;

        return (
          <TableStatusBadge
            status={isActive ? "success" : "warning"}
            label={isActive ? "Activo" : "Inactivo"}
            color={isActive ? "success" : "warning"}
          />
        );
      },
    },
    {
      key: "patient",
      name: "Paciente",
      align: "center",
      render: (row) => (
        <TableAvatarCell
          title={String(row.patientName ?? "")}
          subtitle={`ID: ${String(row.patientIdNumber ?? "")}`}
        />
      ),
    },
    { key: "patientIdNumber", name: "ID/Cédula", align: "center" },
    {
      key: "updatedByName",
      name: "Última edición por",
      align: "center",
      render: (row) => String(row.updatedByName ?? "No disponible"),
    },
    { key: "updatedAt", name: "Fecha de edición", align: "center" },
    {
      key: "evolutionCount",
      name: "Evoluciones",
      align: "center",
      render: (row) => (
        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold">
          {String(row.evolutionCount ?? 0)}
        </span>
      ),
    },
    {
      key: "actions",
      name: "Acciones",
      align: "left",
      render: (row) => {
        const id = String(row.id ?? "");
        const isActive = row.isActive === true;
        const patientId = String(row.patientId ?? "");
        const selectedRecord = records.find((record) => record.id === id);

        return (
          <TableActionCell>
            <WcButtonIcon
              variant="terciary"
              icon="icon-see-details"
              size="sm"
              title="Ver Detalles"
              onClick={() => {
                if (selectedRecord) {
                  onSelectRecord(selectedRecord);
                }
              }}
            />
            <WcButtonIcon
              variant="terciary"
              icon="icon-open-folder"
              size="sm"
              title="Ver Historia Clínica"
              onClick={() => navigate(`/pacientes/${patientId}/historia`)}
            />
            {canAdmin && (
              <WcButtonIcon
                icon={isActive ? "icon-archive" : "icon-unarchive"}
                title={isActive ? "Archivar HC" : "Activar HC"}
                variant={isActive ? "danger" : "secondary"}
                size="sm"
                disabled={isUpdating}
                onClick={() => selectedRecord && handleToggleStatus(selectedRecord)}
              />
            )}
          </TableActionCell>
        );
      },
    },
  ];

  const rows: WcTableRow[] = records.map((record) => ({
    id: record.id,
    patientName: record.patientName,
    patientIdNumber: record.patientIdNumber,
    updatedByName: record.updatedByName,
    evolutionCount: record.evolutionCount,
    updatedAt: new Date(record.updatedAt).toLocaleDateString(),
    patientId: record.patientId,
    isActive: record.isActive,
  }));

  return (
    <div
      className="card"
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
    >
      <WcTables
        columns={columns}
        rows={rows}
        emptyMessage="No se encontraron historias clínicas"
        showPagination={false}
      />
      {DialogComponent}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "var(--space-4)",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
            Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total}{" "}
            resultados
          </span>
          <div style={{ display: "flex", gap: "var(--space-1)", alignItems: "center" }}>
            <button
              type="button"
              className="btn-ghost"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              style={{ padding: "var(--space-1) var(--space-2)" }}
            >
              Anterior
            </button>
            <span
              style={{
                padding: "var(--space-1) var(--space-3)",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              className="btn-ghost"
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
              style={{ padding: "var(--space-1) var(--space-2)" }}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
