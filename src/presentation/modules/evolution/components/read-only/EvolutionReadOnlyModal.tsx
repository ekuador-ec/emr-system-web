import { useNavigate } from "react-router-dom";
import { useEvolution } from "@/presentation/modules/evolution/hooks/useEvolutions";
import { usePatient } from "@/presentation/modules/patient/hooks/usePatients";
import { useMedicalRecordByPatient } from "@/presentation/modules/medical-record/hooks/useMedicalRecord";
import { useOrganizationConfig } from "@/presentation/modules/medical-record/hooks/useOrganizationConfig";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { WcModal } from "@/presentation/modules/shared/components/ui/webcomponents/Modals/WcModal";
import { EvolutionReadOnlyView } from "./EvolutionReadOnlyView";

interface EvolutionReadOnlyModalProps {
  isOpen: boolean;
  patientId: string | null;
  evolutionId: string | null;
  onClose: () => void;
}

export function EvolutionReadOnlyModal({
  isOpen,
  patientId,
  evolutionId,
  onClose,
}: EvolutionReadOnlyModalProps) {
  const navigate = useNavigate();

  const evolutionQuery = useEvolution(evolutionId ?? "");
  const patientQuery = usePatient(patientId ?? "");
  const recordQuery = useMedicalRecordByPatient(patientId ?? "", {
    enabled: Boolean(patientId),
  });
  const orgConfigQuery = useOrganizationConfig();

  const isLoading =
    evolutionQuery.isLoading ||
    patientQuery.isLoading ||
    recordQuery.isLoading ||
    orgConfigQuery.isLoading;

  const hasError =
    evolutionQuery.isError ||
    patientQuery.isError ||
    recordQuery.isError;

  const evolution = evolutionQuery.data;
  const patient = patientQuery.data;
  const medicalRecord = recordQuery.data;
  const orgConfig = orgConfigQuery.data;

  const isClosed = evolution?.status === "CERRADA";

  const handleEdit = () => {
    if (!patientId || !evolutionId) return;
    onClose();
    navigate(`/pacientes/${patientId}/historia/evoluciones/${evolutionId}`);
  };

  const footer = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "var(--space-3)",
        width: "100%",
      }}
    >
      <WcButton variant="secondary" onClick={onClose}>
        Cerrar
      </WcButton>
      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <WcButton
          variant="secondary"
          disabled
          title="Generación de PDF próximamente"
        >
          <Icon name="icon-generate-pdf" size={16} />
          Generar PDF
        </WcButton>
        <WcButton
          variant="primary"
          onClick={handleEdit}
          disabled={!evolution || isClosed}
          title={
            isClosed
              ? "Evolución cerrada: no es posible editar"
              : "Editar evolución"
          }
        >
          <Icon name="icon-edit" size={16} />
          Editar evolución
        </WcButton>
      </div>
    </div>
  );

  const evolutionShortId =
    evolutionId && evolutionId.length >= 8
      ? evolutionId.slice(0, 8).toUpperCase()
      : "";

  return (
    <WcModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle de Evolución Médica"
      subtitle={
        evolutionShortId ? `N° EM · ${evolutionShortId}` : undefined
      }
      maxWidth="min(1180px, 96vw)"
      footer={footer}
      contentClassName="em-pdf-modal__content"
    >
      {isLoading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-8)",
            color: "var(--color-text-secondary)",
            gap: "var(--space-2)",
          }}
        >
          <Icon name="icon-loader" size={20} className="spin" />
          <span>Cargando evolución…</span>
        </div>
      ) : hasError || !evolution || !patient || !medicalRecord ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-8)",
            gap: "var(--space-2)",
            color: "var(--color-danger, #b91c1c)",
            textAlign: "center",
          }}
        >
          <Icon name="icon-warning-solid" size={28} />
          <p style={{ margin: 0, fontWeight: 600 }}>
            No fue posible cargar la información de la evolución.
          </p>
          <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
            Verifica tu conexión o vuelve a intentarlo más tarde.
          </span>
        </div>
      ) : (
        <EvolutionReadOnlyView
          evolution={evolution}
          patient={patient}
          medicalRecord={medicalRecord}
          orgConfig={orgConfig}
        />
      )}
    </WcModal>
  );
}
