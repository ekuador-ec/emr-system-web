import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { MedicalRecord } from "@/domain/modules/medical-record/models/MedicalRecord";
import type { PatientListItem } from "@/domain/modules/patient/models/Patient";
import type { DocumentType } from "@/domain/modules/document/models/ClinicalDocument";
import { usePatients } from "@/presentation/modules/patient/hooks/usePatients";
import {
  useMedicalRecordByPatient,
  useCreateMedicalRecord,
} from "@/presentation/modules/medical-record/hooks/useMedicalRecord";
import { useCreateEvolution } from "@/presentation/modules/evolution/hooks/useEvolutions";
import { useCreateForm005 } from "@/presentation/modules/form005/hooks/useForm005";
import { DOCUMENT_TYPES, getDocumentDefinition } from "@/presentation/modules/document/registry/documentRegistry";
import { WcModal } from "@/presentation/modules/shared/components/ui/webcomponents/Modals/WcModal";
import WcSearchInput from "@/presentation/modules/shared/components/ui/webcomponents/Searchs/wcSearchInput";
import { WcSelect } from "@/presentation/modules/shared/components/ui/webcomponents/Inputs";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { useConfirmDialog } from "@/presentation/modules/shared/components/ui/useConfirmDialog";

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PatientDocumentRowProps {
  patient: PatientListItem;
  isOpen: boolean;
  onCreateDocument: (patient: PatientListItem, medicalRecord: MedicalRecord | null) => Promise<void>;
  onGoToHistory: (patientId: string) => void;
}

function PatientDocumentRow({
  patient,
  isOpen,
  onCreateDocument,
  onGoToHistory,
}: PatientDocumentRowProps) {
  const { data: medicalRecord, isLoading: isLoadingMedicalRecord } = useMedicalRecordByPatient(
    patient.id,
    { enabled: isOpen },
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
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <span style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)" }}>
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
              backgroundColor: hasMedicalRecord ? "rgba(14, 165, 233, 0.12)" : "rgba(245, 158, 11, 0.12)",
              color: hasMedicalRecord ? "#0369a1" : "#b45309",
            }}
          >
            {isLoadingMedicalRecord ? "Verificando HC" : hasMedicalRecord ? "HC encontrada" : "Sin HC"}
          </span>
        </div>
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
          Cédula: {patient.idNumber}
        </span>
      </div>

      <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}>
        <WcButton variant="secondary" onClick={() => onGoToHistory(patient.id)} style={{ whiteSpace: "nowrap" }}>
          <Icon name="icon-open-folder" size={16} />
          Ver HC
        </WcButton>
        <WcButton
          variant="primary"
          disabled={isLoadingMedicalRecord}
          onClick={() => {
            void onCreateDocument(patient, medicalRecord ?? null);
          }}
          style={{ whiteSpace: "nowrap" }}
        >
          <Icon name="icon-plus-solid" size={16} />
          {isLoadingMedicalRecord ? "Cargando..." : hasMedicalRecord ? "Crear documento" : "Crear HC y documento"}
        </WcButton>
      </div>
    </div>
  );
}

export function CreateDocumentModal({ isOpen, onClose }: CreateDocumentModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [selectedType, setSelectedType] = useState<DocumentType>("FORM_008");
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { confirm, DialogComponent } = useConfirmDialog();
  const createMedicalRecord = useCreateMedicalRecord();
  const createEvolution = useCreateEvolution();
  const createForm005 = useCreateForm005();
  const normalizedSearch = submittedSearch.trim();

  const patientsQuery = usePatients(
    { search: normalizedSearch, page: 1, limit: 5, isActive: true },
    { enabled: normalizedSearch.length > 0 },
  );

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSubmittedSearch("");
      setSelectedType("FORM_008");
    }
  }, [isOpen]);

  const handleSearch = () => setSubmittedSearch(searchTerm.trim());

  const handleGoToHistory = (patientId: string) => {
    onClose();
    navigate(`/pacientes/${patientId}/historia`);
  };

  const handleCreateDocument = async (
    patient: PatientListItem,
    medicalRecord: MedicalRecord | null,
  ) => {
    const def = getDocumentDefinition(selectedType);
    const patientName =
      `${patient.firstName} ${patient.lastName} ${patient.secondLastName ?? ""}`.trim();

    const confirmed = await confirm({
      title: medicalRecord ? `Nuevo documento · ${def.shortLabel}` : "Crear HC y documento",
      message: medicalRecord
        ? `Se abrirá un nuevo documento (${def.shortLabel}) para ${patientName}.`
        : `No existe historia clínica para ${patientName}. Se creará una historia clínica y luego el documento (${def.shortLabel}).`,
      confirmText: medicalRecord ? "Crear documento" : "Crear HC y documento",
      cancelText: "Cancelar",
      type: "primary",
    });

    if (!confirmed) return;

    try {
      const record = medicalRecord ?? (await createMedicalRecord.mutateAsync(patient.id));
      const now = new Date();
      const attentionDate = now.toISOString().split("T")[0];
      const attentionTime = now.toTimeString().slice(0, 5);

      let newDocumentId: string;
      if (selectedType === "FORM_005") {
        const created = await createForm005.mutateAsync({
          medicalRecordId: record.id,
        });
        newDocumentId = created.id;
      } else {
        const created = await createEvolution.mutateAsync({
          medicalRecordId: record.id,
          attentionDate,
          attentionTime,
          notifyPolice: false,
          requiresPoliceCustody: false,
          alcoholicBreath: false,
          deathInEmergency: false,
        });
        newDocumentId = created.id;
      }

      addToast({ type: "success", message: `Documento (${def.shortLabel}) creado exitosamente.` });
      onClose();
      navigate(def.workspacePath(record.patientId, newDocumentId));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "No se pudo crear el documento.";
      addToast({ type: "error", message: errorMessage });
    }
  };

  return (
    <>
      <WcModal isOpen={isOpen} onClose={onClose} title="Nuevo Documento Clínico" maxWidth="920px">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)", padding: "var(--space-5)" }}>
          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <Icon name="icon-add-file" size={18} />
              <h3 style={{ margin: 0, fontSize: "var(--font-size-lg)" }}>Tipo de documento</h3>
            </div>
            <WcSelect
              value={selectedType}
              onChange={(value) => setSelectedType(value as DocumentType)}
              options={DOCUMENT_TYPES.map((def) => ({
                value: def.type,
                label: def.label,
                description: def.description,
              }))}
              width="full"
              ariaLabel="Tipo de documento"
            />
          </section>

          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
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

          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", minHeight: "200px" }}>
            {!normalizedSearch ? (
              <div
                style={{
                  border: "1px dashed var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-6)",
                  textAlign: "center",
                  color: "var(--color-text-secondary)",
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
                }}
              >
                No se encontraron pacientes activos con ese criterio.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {(patientsQuery.data?.data ?? []).map((patient) => (
                  <PatientDocumentRow
                    key={patient.id}
                    patient={patient}
                    isOpen={isOpen}
                    onCreateDocument={handleCreateDocument}
                    onGoToHistory={handleGoToHistory}
                  />
                ))}
              </div>
            )}
          </section>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              paddingTop: "var(--space-1)",
              borderTop: "1px solid var(--color-border)",
            }}
          >
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
