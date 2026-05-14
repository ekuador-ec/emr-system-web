import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import { usePatients } from "@/presentation/modules/patient/hooks/usePatients";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { PatientsList } from "@/presentation/modules/patient/components/Patients/PatientsList";
import { PatientSearchFilters } from "@/presentation/modules/patient/components/Patients/PatientSearchFilters";
import { PatientDetailsDrawer } from "@/presentation/modules/patient/components/Patients/PatientDetailsDrawer";
import { WcModuleHeader } from "@/presentation/modules/shared/components/ui/webcomponents/Headers/WcModuleHeader";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";

export function PatientsPage() {
  const {
    setCreateModalOpen,
    setCreateSuccessHandler,
    patientFilters,
    hasSearched,
    selectedPatientId,
    setPatientFilters,
    setHasSearched,
    setSelectedPatientId,
  } = usePatientStore();

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const openIdFromUrl = searchParams.get("openId");
    const queryFromUrl = searchParams.get("search");

    if (!openIdFromUrl && !queryFromUrl) return;

    let mutated = false;
    const nextParams = new URLSearchParams(searchParams);

    if (openIdFromUrl) {
      const cleanId = openIdFromUrl.trim();
      if (cleanId.length > 0) {
        setSelectedPatientId(cleanId);
        nextParams.delete("openId");
        mutated = true;
      }
    }

    if (queryFromUrl) {
      const cleanQuery = queryFromUrl.trim();
      if (cleanQuery.length > 0) {
        const isIdNumber = /^\d+$/.test(cleanQuery);
        setPatientFilters({
          idNumber: isIdNumber ? cleanQuery : undefined,
          search: !isIdNumber ? cleanQuery : undefined,
          page: 1,
        });
        setHasSearched(true);
        nextParams.delete("search");
        mutated = true;
      }
    }

    if (mutated) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setPatientFilters, setHasSearched, setSelectedPatientId, setSearchParams]);

  const {
    data: patientsResult,
    isLoading,
    isError,
    error,
  } = usePatients(
    { ...patientFilters, gender: patientFilters.gender === "" ? undefined : patientFilters.gender },
    { enabled: hasSearched },
  );

  return (
    <div style={{ padding: "var(--space-8)", maxWidth: "1200px", margin: "0 auto" }}>
      <WcModuleHeader
        moduleName="Pacientes"
        moduleIcon="icon-patient"
        title="Directorio de Pacientes"
        description="Busca, consulta y gestiona las historias clínicas de los pacientes."
      >
        <WcButton
          variant="primary"
          onClick={() => {
            setCreateSuccessHandler(null);
            setCreateModalOpen(true);
          }}
          style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}
        >
          <Icon name="icon-user-plus" size={20} />
          Nuevo Paciente
        </WcButton>
      </WcModuleHeader>

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
              border: "1px dashed var(--color-border)",
              boxShadow: "none",
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
                color: "var(--color-text-tertiary)",
              }}
            >
              <Icon name="icon-search" size={24} />
            </div>
            <div style={{ maxWidth: "340px" }}>
              <h3
                style={{
                  marginBottom: "var(--space-2)",
                  color: "var(--color-text-primary)",
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                Comienza una búsqueda
              </h3>
              <p style={{ margin: 0, lineHeight: "1.5" }}>
                Utiliza la barra superior para encontrar un paciente por su número de cédula,
                nombres o apellidos.
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <div
            className="card"
            style={{
              padding: "var(--space-16) var(--space-8)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "var(--space-4)",
            }}
          >
            <div
              className="spinner"
              style={{
                width: "32px",
                height: "32px",
                border: "3px solid var(--color-border)",
                borderTopColor: "var(--color-primary)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <p style={{ color: "var(--color-text-secondary)" }}>Buscando pacientes...</p>
          </div>
        ) : isError ? (
          <div
            className="card"
            style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--color-danger)" }}
          >
            Error al consultar los pacientes: {error.message}
          </div>
        ) : (
          <PatientsList patientsResult={patientsResult} />
        )}
      </div>

      {selectedPatientId && <PatientDetailsDrawer />}
    </div>
  );
}
