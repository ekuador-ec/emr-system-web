import { useNavigate } from "react-router-dom";
import { useForm005 } from "@/presentation/modules/form005/hooks/useForm005";
import { usePatient } from "@/presentation/modules/patient/hooks/usePatients";
import { useMedicalRecordByPatient } from "@/presentation/modules/medical-record/hooks/useMedicalRecord";
import { useOrganizationConfig } from "@/presentation/modules/medical-record/hooks/useOrganizationConfig";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { WcModal } from "@/presentation/modules/shared/components/ui/webcomponents/Modals/WcModal";
import { Form005ReadOnlyView } from "./Form005ReadOnlyView";

interface Form005ReadOnlyModalProps {
  isOpen: boolean;
  patientId: string | null;
  documentId: string | null;
  onClose: () => void;
}

export function Form005ReadOnlyModal({ isOpen, patientId, documentId, onClose }: Form005ReadOnlyModalProps) {
  const navigate = useNavigate();

  const documentQuery = useForm005(documentId ?? "");
  const patientQuery = usePatient(patientId ?? "");
  const recordQuery = useMedicalRecordByPatient(patientId ?? "", {
    enabled: Boolean(patientId),
  });
  const orgConfigQuery = useOrganizationConfig();

  const isLoading =
    documentQuery.isLoading ||
    patientQuery.isLoading ||
    recordQuery.isLoading ||
    orgConfigQuery.isLoading;
  const hasError = documentQuery.isError || patientQuery.isError || recordQuery.isError;

  const document005 = documentQuery.data;
  const patient = patientQuery.data;
  const medicalRecord = recordQuery.data;
  const orgConfig = orgConfigQuery.data;
  const isClosed = document005?.status === "CERRADA";

  const handleEdit = () => {
    if (!patientId || !documentId) return;
    onClose();
    navigate(`/pacientes/${patientId}/historia/documentos/form005/${documentId}`);
  };

  const footer = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-3)", width: "100%" }}>
      <WcButton variant="secondary" onClick={onClose}>
        Cerrar
      </WcButton>
      <WcButton
        variant="primary"
        onClick={handleEdit}
        disabled={!document005 || isClosed}
        title={isClosed ? "Documento cerrado: no es posible editar" : "Editar documento"}
      >
        <Icon name="icon-edit" size={16} />
        Editar documento
      </WcButton>
    </div>
  );

  return (
    <WcModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle de Formulario 005"
      maxWidth="min(1180px, 96vw)"
      footer={footer}
      contentClassName="em-pdf-modal__content"
    >
      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-8)", color: "var(--color-text-secondary)", gap: "var(--space-2)" }}>
          <Icon name="icon-loader" size={20} className="spin" />
          <span>Cargando documento…</span>
        </div>
      ) : hasError || !document005 || !patient || !medicalRecord ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "var(--space-8)", gap: "var(--space-2)", color: "var(--color-danger, #b91c1c)", textAlign: "center" }}>
          <Icon name="icon-warning-solid" size={28} />
          <p style={{ margin: 0, fontWeight: 600 }}>No fue posible cargar la información del documento.</p>
        </div>
      ) : (
        <Form005ReadOnlyView
          document005={document005}
          patient={patient}
          medicalRecord={medicalRecord}
          orgConfig={orgConfig}
        />
      )}
    </WcModal>
  );
}
