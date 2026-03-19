import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import { usePatients } from "@/presentation/modules/patient/hooks/usePatients";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { PatientsList } from "@/presentation/modules/patient/components/Patients/PatientsList";
import { PatientSearchFilters } from "@/presentation/modules/patient/components/Patients/PatientSearchFilters";
import { PatientDetailsDrawer } from "@/presentation/modules/patient/components/Patients/PatientDetailsDrawer";

export function PatientsPage() {
  const {
    setCreateModalOpen,
    patientFilters,
    hasSearched,
    selectedPatientId,
  } = usePatientStore();

  const { data: patientsResult, isLoading, isError, error } = usePatients(patientFilters, {
    enabled: hasSearched,
  });

  return (
    <div style={{ padding: "var(--space-8)", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-6)",
          flexWrap: "wrap",
          gap: "var(--space-3)",
        }}
      >
        <div>
          <h1 style={{ marginBottom: "var(--space-1)" }}>Directorio de Pacientes</h1>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
            Busca, consulta y gestiona las historias clínicas de los pacientes.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setCreateModalOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}
        >
          <Icon name="icon-user-plus" size={20} />
          Nuevo Paciente
        </button>
      </div>

      <PatientSearchFilters />

      <div style={{ marginTop: "var(--space-6)" }}>
        {!hasSearched ? (
          <div
            className="card"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "var(--space-16) var(--space-8)",
              textAlign: "center",
              color: "var(--color-text-secondary)",
              gap: "var(--space-4)",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--color-bg-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="icon-search" size={28} />
            </div>
            <p style={{ margin: 0 }}>
              Utiliza los filtros de arriba para buscar un paciente por cédula, nombre o apellidos.
            </p>
          </div>
        ) : isLoading ? (
          <div className="card" style={{ padding: "var(--space-8)", textAlign: "center" }}>
            Cargando pacientes...
          </div>
        ) : isError ? (
          <div className="card" style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--color-danger)" }}>
            Error al cargar pacientes: {error.message}
          </div>
        ) : (
          <PatientsList patientsResult={patientsResult} />
        )}
      </div>

      {selectedPatientId && (
        <PatientDetailsDrawer />
      )}
    </div>
  );
}
