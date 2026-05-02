import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { MedicalRecord } from "@/domain/modules/medical-record/models/MedicalRecord";
import type { PatientListItem } from "@/domain/modules/patient/models/Patient";
import { usePatients } from "@/presentation/modules/patient/hooks/usePatients";
import {
  useMedicalRecordByPatient,
  useCreateMedicalRecord,
} from "@/presentation/modules/medical-record/hooks/useMedicalRecord";
import { useCreateEvolution } from "@/presentation/modules/evolution/hooks/useEvolutions";
import { WcModal } from "@/presentation/modules/shared/components/ui/webcomponents/Modals/WcModal";
import WcSearchInput from "@/presentation/modules/shared/components/ui/webcomponents/Searchs/wcSearchInput";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { useConfirmDialog } from "@/presentation/modules/shared/components/ui/useConfirmDialog";

interface CreateEvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PatientEvolutionRowProps {
  patient: PatientListItem;
  isOpen: boolean;
  onCreateEvolution: (
    patient: PatientListItem,
    medicalRecord: MedicalRecord | null,
  ) => Promise<void>;
  onGoToHistory: (patientId: string) => void;
}

function PatientEvolutionRow({
  patient,
  isOpen,
  onCreateEvolution,
  onGoToHistory,
}: PatientEvolutionRowProps) {
  const { data: medicalRecord, isLoading: isLoadingMedicalRecord } = useMedicalRecordByPatient(
    patient.id,
    {
      enabled: isOpen,
    },
  );
  const hasMedicalRecord = Boolean(medicalRecord);
  const patientFullName =
    `${patient.firstName} ${patient.lastName} ${patient.secondLastName ?? ""}`.trim();

  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        backgroundColor: "var(--color-surface)",
        padding: "var(--space-4)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "var(--space-4)",
        flexWrap: "wrap",
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
            {patientFullName}
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
                ? "rgba(14, 165, 233, 0.12)"
                : "rgba(245, 158, 11, 0.12)",
              color: hasMedicalRecord ? "#0369a1" : "#b45309",
            }}
          >
            {isLoadingMedicalRecord
              ? "Verificando HC"
              : hasMedicalRecord
                ? "HC encontrada"
                : "Sin HC"}
          </span>
        </div>
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
          Cédula: {patient.idNumber}
        </span>
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
          {hasMedicalRecord
            ? "Puedes abrir una nueva evolución médica asociada a esta historia clínica."
            : "Si no existe historia clínica, puedes crearla y continuar con la evolución."}
        </span>
      </div>

      <div
        style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}
      >
        <WcButton
          variant="secondary"
          onClick={() => onGoToHistory(patient.id)}
          style={{ whiteSpace: "nowrap" }}
        >
          <Icon name="icon-open-folder" size={16} />
          Ver HC
        </WcButton>
        <WcButton
          variant="primary"
          disabled={isLoadingMedicalRecord}
          onClick={() => {
            void onCreateEvolution(patient, medicalRecord ?? null);
          }}
          style={{ whiteSpace: "nowrap" }}
        >
          <Icon name="icon-plus" size={16} />
          {isLoadingMedicalRecord
            ? "Cargando..."
            : hasMedicalRecord
              ? "Crear evolución"
              : "Crear HC y evolución"}
        </WcButton>
      </div>
    </div>
  );
}

export function CreateEvolutionModal({ isOpen, onClose }: CreateEvolutionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { confirm, DialogComponent } = useConfirmDialog();
  const createMedicalRecord = useCreateMedicalRecord();
  const createEvolution = useCreateEvolution();
  const normalizedSearch = submittedSearch.trim();

  const patientsQuery = usePatients(
    {
      search: normalizedSearch,
      page: 1,
      limit: 5,
      isActive: true,
    },
    {
      enabled: normalizedSearch.length > 0,
    },
  );

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSubmittedSearch("");
    }
  }, [isOpen]);

  const handleSearch = () => {
    setSubmittedSearch(searchTerm.trim());
  };

  const handleGoToHistory = (patientId: string) => {
    onClose();
    navigate(`/pacientes/${patientId}/historia`);
  };

  const handleCreateEvolution = async (
    patient: PatientListItem,
    medicalRecord: MedicalRecord | null,
  ) => {
    const patientName =
      `${patient.firstName} ${patient.lastName} ${patient.secondLastName ?? ""}`.trim();

    const confirmed = await confirm({
      title: medicalRecord ? "Nueva Evolución Médica" : "Crear HC y Evolución",
      message: medicalRecord
        ? `Se abrirá una nueva evolución médica para ${patientName}.`
        : `No existe historia clínica para ${patientName}. Se creará una historia clínica y luego una nueva evolución médica.`,
      confirmText: medicalRecord ? "Crear Evolución" : "Crear HC y Evolución",
      cancelText: "Cancelar",
      type: "primary",
    });

    if (!confirmed) {
      return;
    }

    try {
      const record = medicalRecord ?? (await createMedicalRecord.mutateAsync(patient.id));
      const now = new Date();
      const newEvolution = await createEvolution.mutateAsync({
        medicalRecordId: record.id,
        attentionDate: now.toISOString().split("T")[0],
        attentionTime: now.toTimeString().slice(0, 5),
        notifyPolice: false,
        requiresPoliceCustody: false,
        alcoholicBreath: false,
        deathInEmergency: false,
      });

      addToast({
        type: "success",
        message: "Evolución médica creada exitosamente.",
      });
      onClose();
      navigate(`/pacientes/${record.patientId}/historia/evoluciones/${newEvolution.id}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "No se pudo crear la evolución médica.";
      addToast({
        type: "error",
        message: errorMessage,
      });
    }
  };

  return (
    <>
      <WcModal isOpen={isOpen} onClose={onClose} title="Nueva Evolución Médica" maxWidth="920px">
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
              background:
                "linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(15, 23, 42, 0.02))",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                flexWrap: "wrap",
              }}
            >
              <Icon name="icon-search-folder" size={18} />
              <h3 style={{ margin: 0, fontSize: "var(--font-size-lg)" }}>
                Buscar historia clínica o paciente
              </h3>
            </div>
            <p
              style={{
                margin: 0,
                color: "var(--color-text-secondary)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              Busca por cédula, nombre o apellido. Si el paciente no tiene historia clínica, podrás
              crearla y continuar con la evolución.
            </p>
            <WcSearchInput
              value={searchTerm}
              onValueChange={setSearchTerm}
              placeholder="Buscar por cédula, nombre o apellido..."
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
            {!normalizedSearch ? (
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
                Escribe un criterio de búsqueda y presiona Buscar para localizar pacientes.
              </div>
            ) : patientsQuery.isLoading || patientsQuery.isFetching ? (
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
            ) : (patientsQuery.data?.data ?? []).length === 0 ? (
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
                No se encontraron pacientes activos con ese criterio.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {(patientsQuery.data?.data ?? []).map((patient) => (
                  <PatientEvolutionRow
                    key={patient.id}
                    patient={patient}
                    isOpen={isOpen}
                    onCreateEvolution={handleCreateEvolution}
                    onGoToHistory={handleGoToHistory}
                  />
                ))}
              </div>
            )}
          </section>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "var(--space-3)",
              paddingTop: "var(--space-1)",
              borderTop: "1px solid var(--color-border)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
              <span
                style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)" }}
              >
                Flujo de creación
              </span>
              <span
                style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}
              >
                La evolución se crea con fecha y hora actual para continuar en el workspace.
              </span>
            </div>
            <WcButton variant="secondary" onClick={onClose}>
              Cerrar
            </WcButton>
          </div>
        </div>
      </WcModal>
      {DialogComponent}
    </>
  );
}
