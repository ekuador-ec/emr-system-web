import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import type { PatientListItem } from "@/domain/modules/patient/models/Patient";
import { WcModal } from "@/presentation/modules/shared/components/ui/webcomponents/Modals/WcModal";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcSearchInput from "@/presentation/modules/shared/components/ui/webcomponents/Searchs/wcSearchInput";
import { usePatients } from "@/presentation/modules/patient/hooks/usePatients";
import {
  useCreateMedicalRecord,
  useMedicalRecordByPatient,
} from "@/presentation/modules/medical-record/hooks/useMedicalRecord";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";

interface CreateMedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PatientSearchResultRowProps {
  patient: PatientListItem;
  isCreating: boolean;
  onCreateRecord: (patientId: string) => void;
  onGoToRecord: (patientId: string) => void;
}

function PatientSearchResultRow({
  patient,
  isCreating,
  onCreateRecord,
  onGoToRecord,
}: PatientSearchResultRowProps) {
  const { data: existingMedicalRecord, isLoading: isCheckingRecord } = useMedicalRecordByPatient(
    patient.id,
    { enabled: true },
  );

  const hasMedicalRecord = !!existingMedicalRecord;

  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        backgroundColor: "var(--color-surface)",
        padding: "var(--space-4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-4)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", minWidth: 0 }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}
        >
          <span
            style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)" }}
          >
            {patient.firstName} {patient.lastName}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-1)",
              padding: "var(--space-1) var(--space-2)",
              borderRadius: "999px",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-medium)",
              backgroundColor: hasMedicalRecord
                ? "rgba(245, 158, 11, 0.12)"
                : "rgba(16, 185, 129, 0.12)",
              color: hasMedicalRecord ? "#b45309" : "#047857",
            }}
          >
            {isCheckingRecord ? "Verificando" : hasMedicalRecord ? "Ya tiene HC" : "Sin HC"}
          </span>
        </div>
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-secondary)",
          }}
        >
          Cédula: {patient.idNumber}
        </span>
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            color: hasMedicalRecord ? "#b45309" : "var(--color-text-secondary)",
          }}
        >
          {hasMedicalRecord
            ? "Este paciente ya cuenta con una historia clínica activa."
            : "Puedes crear una nueva historia clínica para este paciente."}
        </span>
      </div>

      {isCheckingRecord ? (
        <WcButton variant="secondary" disabled style={{ minWidth: "140px" }}>
          Verificando...
        </WcButton>
      ) : hasMedicalRecord ? (
        <WcButton
          variant="secondary"
          style={{ minWidth: "140px", justifyContent: "center" }}
          onClick={() => onGoToRecord(patient.id)}
        >
          Ir a HC
        </WcButton>
      ) : (
        <WcButton
          variant="primary"
          disabled={isCreating}
          style={{ minWidth: "140px", justifyContent: "center" }}
          onClick={() => onCreateRecord(patient.id)}
        >
          Crear HC
        </WcButton>
      )}
    </div>
  );
}

export function CreateMedicalRecordModal({ isOpen, onClose }: CreateMedicalRecordModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { setCreateModalOpen, setCreateSuccessHandler } = usePatientStore();
  const searchQuery = submittedSearch.trim();

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSubmittedSearch("");
    }
  }, [isOpen]);

  const {
    data: patientsData,
    isLoading: isLoadingPatients,
    isFetching: isFetchingPatients,
  } = usePatients(
    {
      search: searchQuery,
      page: 1,
      limit: 5,
      isActive: true,
    },
    {
      enabled: searchQuery.length > 0,
    },
  );

  const { mutate: createMedicalRecord, isPending: isCreating } = useCreateMedicalRecord();
  const patientResults = patientsData?.data ?? [];

  const handleSearch = () => {
    const normalizedSearch = searchTerm.trim();
    setSubmittedSearch(normalizedSearch);
  };

  const handleCreateRecord = (patientId: string) => {
    createMedicalRecord(patientId, {
      onSuccess: () => {
        addToast({
          type: "success",
          message: "Historia Clínica creada exitosamente",
        });
        onClose();
        navigate(`/pacientes/${patientId}/historia`);
      },
      onError: (err) => {
        const errorMessage = err.message.toLowerCase();
        const alreadyExists =
          errorMessage.includes("duplicate key value violates unique constraint") ||
          errorMessage.includes("medical_records_patient_id_key") ||
          errorMessage.includes("unique constraint");

        addToast({
          type: alreadyExists ? "warning" : "error",
          message: alreadyExists
            ? "Este paciente ya cuenta con una historia clínica. Puedes ir directamente a ella."
            : `Error al crear historia: ${err.message}`,
        });

        if (alreadyExists) {
          onClose();
          navigate(`/pacientes/${patientId}/historia`);
        }
      },
    });
  };

  const handleGoToRecord = (patientId: string) => {
    onClose();
    navigate(`/pacientes/${patientId}/historia`);
  };

  const handleCreatePatient = () => {
    setCreateSuccessHandler((patient) => {
      onClose();
      navigate(`/pacientes/${patient.id}/historia`);
    });
    setCreateModalOpen(true);
  };

  return (
    <WcModal isOpen={isOpen} onClose={onClose} title="Crear Historia Clínica" maxWidth="760px">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-5)",
          padding: "var(--space-5)",
        }}
      >
        <section
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
            backgroundColor: "rgba(255, 255, 255, 0.02)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <p
              style={{
                margin: 0,
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-secondary)",
              }}
            >
              Busca por cédula, nombre o apellido. La búsqueda se ejecuta solo cuando la solicitas.
            </p>
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
              Solo se mostrarán resultados activos y hasta 5 coincidencias.
            </span>
          </div>

          <WcSearchInput
            value={searchTerm}
            onValueChange={setSearchTerm}
            placeholder="Buscar paciente por cédula, nombre o apellido..."
            showSubmitButton
            submitButtonLabel="Buscar"
            onSubmit={handleSearch}
            submitButtonDisabled={!searchTerm.trim()}
            onClear={() => {
              setSearchTerm("");
              setSubmittedSearch("");
            }}
          />
        </section>

        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
            minHeight: "220px",
          }}
        >
          {!searchQuery ? (
            <div
              style={{
                border: "1px dashed var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-6)",
                textAlign: "center",
                color: "var(--color-text-secondary)",
                backgroundColor: "rgba(255, 255, 255, 0.015)",
              }}
            >
              Escribe un criterio de búsqueda y presiona Buscar para ver coincidencias.
            </div>
          ) : isLoadingPatients || isFetchingPatients ? (
            <div
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-6)",
                textAlign: "center",
                color: "var(--color-text-secondary)",
                backgroundColor: "rgba(255, 255, 255, 0.015)",
              }}
            >
              Buscando pacientes...
            </div>
          ) : patientResults.length === 0 ? (
            <div
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-6)",
                textAlign: "center",
                color: "var(--color-text-secondary)",
                backgroundColor: "rgba(255, 255, 255, 0.015)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
              }}
            >
              <span style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text)" }}>
                No se encontraron pacientes
              </span>
              <span>Verifica la cédula, nombre o apellido ingresado e intenta nuevamente.</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {patientResults.map((patient) => (
                <PatientSearchResultRow
                  key={patient.id}
                  patient={patient}
                  isCreating={isCreating}
                  onCreateRecord={handleCreateRecord}
                  onGoToRecord={handleGoToRecord}
                />
              ))}
            </div>
          )}
        </section>

        <section
          style={{
            borderTop: "1px solid var(--color-border)",
            paddingTop: "var(--space-4)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
            alignItems: "center",
          }}
        >
          <div
            style={{
              textAlign: "center",
              color: "var(--color-text-secondary)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            ¿El paciente no existe en el sistema?
          </div>
          <WcButton
            variant="primary"
            style={{ width: "fit-content", alignSelf: "center" }}
            onClick={handleCreatePatient}
          >
            <Icon name="icon-user-plus" size={16} />
            Crear Paciente
          </WcButton>
        </section>
      </div>
    </WcModal>
  );
}
