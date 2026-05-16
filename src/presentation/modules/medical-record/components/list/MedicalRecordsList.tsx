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
} from "@/presentation/modules/shared/components/ui/webcomponents/Tables/wcTables";
import type {
  WcTableColumn,
  WcTableRow,
} from "@/presentation/modules/shared/components/ui/webcomponents/Tables/wcTables";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import WcTag from "@/presentation/modules/shared/components/ui/webcomponents/Tags/wcTag";
import { useConfirmDialog } from "@/presentation/modules/shared/components/ui/useConfirmDialog";
import "@/presentation/modules/medical-record/components/list/MedicalRecordsList.css";

interface MedicalRecordsListProps {
  result?: PaginatedResult<MedicalRecordListItem>;
  onSelectRecord: (record: MedicalRecordListItem) => void;
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
  const paginationItems = getPaginationItems(totalPages, page);

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage, limit: 10 });
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
      width: "150px",
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
      key: "patient",
      name: "Paciente",
      align: "left",
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
        <WcTag variant="neutral" size="sm">
          {String(row.evolutionCount ?? 0)}
        </WcTag>
      ),
    },
    {
      key: "actions",
      name: "Acciones",
      align: "center",
      width: "132px",
      render: (row) => {
        const id = String(row.id ?? "");
        const isActive = row.isActive === true;
        const patientId = String(row.patientId ?? "");
        const selectedRecord = records.find((record) => record.id === id);

        return (
          <TableActionCell className="medical-records-table-action-cell">
            <WcButtonIcon
              variant="terciary"
              icon="icon-see-details"
              size="sm"
              className="medical-records-table-action-icon"
              title="Ver Detalles"
              onClick={() => {
                if (selectedRecord) {
                  onSelectRecord(selectedRecord);
                }
              }}
            />
            <WcButtonIcon
              variant="primary"
              icon="icon-open-folder"
              size="sm"
              className="medical-records-table-action-icon"
              title="Ver Historia Clínica"
              onClick={() => navigate(`/pacientes/${patientId}/historia`)}
            />
            {canAdmin && (
              <WcButtonIcon
                icon={isActive ? "icon-archive" : "icon-unarchive"}
                title={isActive ? "Archivar HC" : "Activar HC"}
                variant="danger"
                size="sm"
                className="medical-records-table-action-icon"
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
    <>
      <WcTables
        columns={columns}
        rows={rows}
        emptyMessage="No se encontraron historias clínicas"
        showPagination={false}
        className="medical-records-table"
      />
      {DialogComponent}
      {totalPages > 1 && (
        <div className="wc-tables__footer">
          <span className="wc-tables__summary">
            Mostrando {(page - 1) * limit + 1}-{Math.min(page * limit, total)} de {total} registros
          </span>
          <div className="wc-tables__pagination">
            <WcButton
              variant="primary"
              className="wc-tables__pagination-btn"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
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
                  className={`wc-tables__pagination-btn${page === item ? " wc-tables__pagination-btn--active" : ""}`}
                  onClick={() => handlePageChange(item)}
                  aria-current={page === item ? "page" : undefined}
                >
                  {item}
                </WcButton>
              ),
            )}
            <WcButton
              variant="primary"
              className="wc-tables__pagination-btn"
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
              aria-label="Pagina siguiente"
            >
              {">"}
            </WcButton>
          </div>
        </div>
      )}
    </>
  );
}
