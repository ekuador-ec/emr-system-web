import type { PaginatedResult, PatientListItem } from "@/domain/modules/patient/models/Patient";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { useTogglePatientStatus } from "@/presentation/modules/patient/hooks/usePatients";

interface PatientsListProps {
  patientsResult?: PaginatedResult<PatientListItem>;
}

export function PatientsList({ patientsResult }: PatientsListProps) {
  const { setPatientFilters, setSelectedPatientId, setEditingPatientId } = usePatientStore();
  const { mutate: toggleStatus, isPending: isToggling } = useTogglePatientStatus();
  const { addToast } = useToastStore();

  if (!patientsResult) return null;

  const { data: patients, total, page, limit } = patientsResult;
  const totalPages = Math.ceil(total / limit);

  const handlePageChange = (newPage: number) => {
    setPatientFilters({ page: newPage });
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleStatus(
      { id, isActive: !currentStatus },
      {
        onSuccess: () => {
          addToast({
            type: "success",
            message: `Paciente ${!currentStatus ? "activado" : "archivado"} exitosamente`,
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
            <th style={thStyle}>Cédula</th>
            <th style={thStyle}>Paciente</th>
            <th style={thStyle}>Contacto</th>
            <th style={thStyle}>Estado</th>
            <th style={thStyle}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
              <td style={tdStyle}>{patient.idNumber}</td>
              <td style={tdStyle}>
                <div style={{ fontWeight: "var(--font-weight-medium)" }}>
                  {patient.firstName} {patient.lastName} {patient.secondLastName || ""}
                </div>
                {patient.bloodType && (
                  <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
                    Grupo Sanguíneo: {patient.bloodType}
                  </span>
                )}
              </td>
              <td style={tdStyle}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {patient.phone ? <span>{patient.phone}</span> : <span style={{ color: "var(--color-text-tertiary)" }}>Sin teléfono</span>}
                  {patient.email ? <span style={{ color: "var(--color-text-secondary)" }}>{patient.email}</span> : null}
                </div>
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
                    backgroundColor: patient.isActive ? "var(--color-success-light)" : "var(--color-warning-light)",
                    color: patient.isActive ? "var(--color-success)" : "var(--color-warning)",
                  }}
                >
                  {patient.isActive ? "Activo" : "Archivado"}
                </span>
              </td>
              <td style={tdStyle}>
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setSelectedPatientId(patient.id)}
                    style={{ padding: "var(--space-1) var(--space-2)", fontSize: "var(--font-size-xs)" }}
                    title="Ver Detalles del Paciente"
                  >
                    <Icon name="icon-card-info" size={16} />
                    Detalles
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setEditingPatientId(patient.id)}
                    style={{ padding: "var(--space-1) var(--space-2)", fontSize: "var(--font-size-xs)" }}
                    title="Editar Paciente"
                  >
                    <Icon name="icon-edit" size={16} />
                    Editar
                  </button>
                  <button
                    type="button"
                    className={patient.isActive ? "btn-danger" : "btn-secondary"}
                    onClick={() => handleToggleStatus(patient.id, patient.isActive)}
                    disabled={isToggling}
                    style={{ padding: "var(--space-1) var(--space-2)", fontSize: "var(--font-size-xs)" }}
                  >
                    {patient.isActive ? "Archivar" : "Activar"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {patients.length === 0 && (
            <tr>
              <td colSpan={5} style={{ ...tdStyle, textAlign: "center", color: "var(--color-text-secondary)", padding: "var(--space-8)" }}>
                No se encontraron pacientes con los criterios de búsqueda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {/* Pagination Controls */}
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
