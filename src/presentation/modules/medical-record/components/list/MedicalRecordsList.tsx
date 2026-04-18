import { useNavigate } from "react-router-dom";
import type { PaginatedResult, MedicalRecordListItem } from "@/domain/modules/medical-record/models/MedicalRecord";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { useMedicalRecordStore } from "@/presentation/modules/medical-record/stores/useMedicalRecordStore";
import { useUpdateMedicalRecordStatus } from "@/presentation/modules/medical-record/hooks/useMedicalRecord";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { canChangeMedicalRecordStatus } from "@/presentation/core/security/medicalRecordPermissions";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";

interface MedicalRecordsListProps {
  result?: PaginatedResult<MedicalRecordListItem>;
  onSelectRecord: (record: MedicalRecordListItem) => void;
}

export function MedicalRecordsList({ result, onSelectRecord }: MedicalRecordsListProps) {
  const navigate = useNavigate();
  const { setFilters } = useMedicalRecordStore();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateMedicalRecordStatus();
  const { addToast } = useToastStore();
  const { user } = useAuth();
  
  const canAdmin = canChangeMedicalRecordStatus(user?.role);

  if (!result) return null;

  const { data: records, total, page, limit } = result;
  const totalPages = Math.ceil(total / limit);

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
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
        }
      }
    );
  };

  return (
    <div className="card" style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-sm)" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--color-border)", textAlign: "left" }}>
            <th style={thStyle}>Paciente</th>
            <th style={thStyle}>ID/Cédula</th>
            <th style={thStyle}>Evoluciones</th>
            <th style={thStyle}>Actualizado</th>
            <th style={thStyle}>Estado</th>
            <th style={thStyle}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
              <td style={tdStyle}>
                <div style={{ fontWeight: "var(--font-weight-medium)" }}>
                  {record.patientName}
                </div>
              </td>
              <td style={tdStyle}>{record.patientIdNumber}</td>
              <td style={tdStyle}>
                 <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold">
                   {record.evolutionCount}
                 </span>
              </td>
              <td style={tdStyle}>
                {new Date(record.updatedAt).toLocaleDateString()}
              </td>
              <td style={tdStyle}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "var(--space-1) var(--space-2)",
                    borderRadius: "var(--radius-full)",
                    fontSize: "var(--font-size-xs)",
                    fontWeight: "var(--font-weight-semibold)",
                    backgroundColor: record.isActive ? "var(--color-success-light)" : "var(--color-warning-light)",
                    color: record.isActive ? "var(--color-success)" : "var(--color-warning)",
                  }}
                >
                  {record.isActive ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td style={tdStyle}>
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => onSelectRecord(record)}
                    style={{ padding: "var(--space-1) var(--space-2)", fontSize: "var(--font-size-xs)" }}
                    title="Ver Detalles"
                  >
                    <Icon name="icon-see-details" size={16} />
                    Detalles
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => navigate(`/pacientes/${record.patientId}/historia`)}
                    style={{ padding: "var(--space-1) var(--space-2)", fontSize: "var(--font-size-xs)" }}
                    title="Ver Historia Clínica"
                  >
                    <Icon name="icon-medical-record" size={16} />
                    Historia
                  </button>
                  {canAdmin && (
                    <button
                      type="button"
                      className={record.isActive ? "btn-danger" : "btn-secondary"}
                      onClick={() => handleToggleStatus(record.id, record.isActive)}
                      disabled={isUpdating}
                      style={{ padding: "var(--space-1) var(--space-2)", fontSize: "var(--font-size-xs)" }}
                    >
                      {record.isActive ? "Desactivar" : "Activar"}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {records.length === 0 && (
            <tr>
              <td colSpan={6} style={{ ...tdStyle, textAlign: "center", color: "var(--color-text-secondary)", padding: "var(--space-8)" }}>
                No se encontraron historias clínicas.
              </td>
            </tr>
          )}
        </tbody>
      </table>

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
            Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total} resultados
          </span>
          <div style={{ display: "flex", gap: "var(--space-1)" }}>
            <button
              type="button"
              className="btn-ghost"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              style={{ padding: "var(--space-1) var(--space-2)" }}
            >
              Anterior
            </button>
            <span style={{ padding: "var(--space-1) var(--space-3)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)" }}>
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

const thStyle: React.CSSProperties = {
  padding: "var(--space-3) var(--space-2)",
  fontWeight: "var(--font-weight-semibold)",
  fontSize: "var(--font-size-xs)",
  color: "var(--color-text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const tdStyle: React.CSSProperties = {
  padding: "var(--space-3) var(--space-2)",
  verticalAlign: "middle",
};
